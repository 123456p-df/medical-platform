"""
RadSight-8B multimodal inference microservice.

Loads the real RadSightQwen3ForCausalLM checkpoint on Apple Silicon (MPS + SDPA),
optionally INT8-quantizes the language backbone, and serves Talk-to-CT.
"""

from __future__ import annotations

import logging
import os
import sys
import threading
from pathlib import Path
from typing import Any, Optional

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from radsight_runtime.env import load_settings  # noqa: E402
from radsight_runtime.volume import inspect_nifti_volume  # noqa: E402

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("radsight-service")

SETTINGS = load_settings()
PROJECT_ROOT = SCRIPT_DIR.parent


@asynccontextmanager
async def lifespan(app: FastAPI):
    thread = threading.Thread(target=_load_model_worker, name="radsight-load", daemon=True)
    thread.start()
    yield


app = FastAPI(
    title="RadSight-8B Multimodal Microservice",
    version="1.1.0",
    description="Local RadSight-8B 3D CT visual question answering.",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PatientContext(BaseModel):
    patient_id: Optional[str] = None
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    symptoms: Optional[str] = None
    medical_history: Optional[str] = None


class TalkToCTRequest(BaseModel):
    ct_path: str = Field(..., description="Path to the CT volume (.nii.gz)")
    question: str = Field(..., description="Clinical question")
    patient_context: Optional[PatientContext] = None
    study_id: Optional[str] = None
    target_slice: Optional[int] = None
    modality: Optional[str] = "volume"


class SeriesSummaryRequest(BaseModel):
    ct_path: str


_state_lock = threading.Lock()
_loaded = threading.Event()
_runtime: dict[str, Any] = {
    "status": "loading",
    "loaded": False,
    "stub": False,
    "error": None,
    "bundle": None,
    "quant": SETTINGS.quant,
    "quant_cache_hit": False,
    "device": SETTINGS.device,
    "dtype": SETTINGS.dtype_name,
    "attn": SETTINGS.attn,
    "weights_path": str(SETTINGS.model_path),
    "weights_exist": SETTINGS.model_path.exists(),
    "vision_encoder_path": str(SETTINGS.vision_encoder_path),
    "quant_cache": str(SETTINGS.quant_cache),
}


def _health_payload() -> dict[str, Any]:
    with _state_lock:
        return {
            "status": _runtime["status"],
            "service": "RadSight-8B Multimodal Microservice",
            "port": SETTINGS.port,
            "loaded": _runtime["loaded"],
            "stub": _runtime["stub"],
            "device": _runtime["device"],
            "dtype": _runtime["dtype"],
            "quant": _runtime["quant"],
            "attn": _runtime["attn"],
            "weights_path": _runtime["weights_path"],
            "weights_exist": Path(_runtime["weights_path"]).exists(),
            "vision_encoder_path": _runtime["vision_encoder_path"],
            "quant_cache": _runtime["quant_cache"],
            "quant_cache_hit": _runtime["quant_cache_hit"],
            "error": _runtime["error"],
        }


def _load_model_worker() -> None:
    try:
        from radsight_runtime.loader import load_radsight

        logger.info(
            "Loading RadSight-8B device=%s quant=%s path=%s",
            SETTINGS.device,
            SETTINGS.quant,
            SETTINGS.model_path,
        )
        bundle = load_radsight(SETTINGS)
        with _state_lock:
            _runtime.update(
                {
                    "status": "ready",
                    "loaded": True,
                    "stub": False,
                    "error": None,
                    "bundle": bundle,
                    "quant": bundle.quant,
                    "quant_cache_hit": bundle.quant_cache_hit,
                    "device": bundle.device,
                    "dtype": str(bundle.dtype).replace("torch.", ""),
                    "attn": bundle.attn,
                }
            )
        logger.info("RadSight-8B ready quant=%s cache_hit=%s", bundle.quant, bundle.quant_cache_hit)
    except Exception as exc:
        logger.exception("Failed to load RadSight-8B")
        with _state_lock:
            _runtime.update(
                {
                    "status": "error",
                    "loaded": False,
                    "stub": False,
                    "error": str(exc),
                    "bundle": None,
                }
            )
    finally:
        _loaded.set()


def _wait_until_ready() -> None:
    with _state_lock:
        status = _runtime["status"]
    if status == "ready":
        return
    if status == "error":
        raise HTTPException(status_code=503, detail=_health_payload())
    if not _loaded.wait(timeout=SETTINGS.load_timeout_s):
        raise HTTPException(status_code=503, detail={"status": "loading", "error": "model still loading"})
    with _state_lock:
        status = _runtime["status"]
    if status != "ready":
        raise HTTPException(status_code=503, detail=_health_payload())


def _build_question(req: TalkToCTRequest) -> str:
    question = req.question.strip()
    patient = req.patient_context
    if not patient:
        return question
    extras = []
    if patient.name or patient.age or patient.gender:
        extras.append(
            f"Patient: {patient.name or 'unknown'}, {patient.gender or 'unknown'}, {patient.age or 'unknown'} years."
        )
    if patient.symptoms:
        extras.append(f"Symptoms: {patient.symptoms}")
    if patient.medical_history:
        extras.append(f"History: {patient.medical_history}")
    if not extras:
        return question
    return question + "\n\n" + "\n".join(extras)


@app.get("/health")
def health_check():
    return _health_payload()


@app.post("/v1/vision/series_summary")
def get_series_summary(req: SeriesSummaryRequest):
    try:
        meta = inspect_nifti_volume(req.ct_path)
        return {"status": "success", "metadata": meta}
    except Exception as exc:
        logger.error("Failed to inspect CT volume %s: %s", req.ct_path, exc)
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/v1/vision/talk_to_ct")
def talk_to_ct(req: TalkToCTRequest):
    logger.info("Talk to CT path=%s question=%s", req.ct_path, req.question[:120])
    if SETTINGS.allow_stub and os.environ.get("RADSIGHT_FORCE_STUB") == "1":
        raise HTTPException(status_code=503, detail="stub mode is test-only and disabled for live Talk-to-CT")

    _wait_until_ready()
    try:
        volume_meta = inspect_nifti_volume(req.ct_path)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not read CT volume: {exc}") from exc

    from radsight_runtime.infer import generate_volume_answer

    bundle = _runtime["bundle"]
    try:
        generated = generate_volume_answer(
            bundle,
            volume_meta["resolved_path"],
            _build_question(req),
            max_new_tokens=SETTINGS.max_new_tokens,
            search_roots=None,
        )
    except Exception as exc:
        logger.exception("RadSight generate failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    analysis = generated["analysis"]
    return {
        "status": "success",
        "model": "RadSight-8B",
        "device": _runtime["device"],
        "quant": _runtime["quant"],
        "loaded": True,
        "stub": False,
        "latency_ms": generated["latency_ms"],
        "series_info": {
            "filename": volume_meta["filename"],
            "slice_count": volume_meta["slice_count"],
            "spacing": volume_meta["spacing"],
            "dimensions": volume_meta["dimensions"],
            "hu_range": volume_meta["hu_range"],
            "mean_hu": volume_meta["mean_hu"],
        },
        "analysis": analysis,
        "raw_text": generated["raw_text"],
    }


if __name__ == "__main__":
    logger.info("Starting RadSight-8B microservice on http://127.0.0.1:%s", SETTINGS.port)
    uvicorn.run(app, host="127.0.0.1", port=SETTINGS.port, log_level="info")
