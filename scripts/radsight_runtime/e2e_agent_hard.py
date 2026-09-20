#!/usr/bin/env python3
"""High-difficulty live agent E2E: multi-series CT selection + RadSight + records + QC + report."""

from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

BACKEND = os.environ.get("E2E_BACKEND", "http://127.0.0.1:8000")
RADSIGHT = os.environ.get("E2E_RADSIGHT", "http://127.0.0.1:8001")
USERNAME = os.environ.get("E2E_USER", "demo_doctor")
PASSWORD = os.environ.get("E2E_PASSWORD", "123456")
PATIENT_ID = int(os.environ.get("E2E_PATIENT_ID", "1"))
TEMPLATE_NEEDLES = ("4.2mm", "LU-RADS 2", "LU-RADS 2 类")

HARD_PROMPT = (
    "你是三甲放射科住院总医师助手。请完成一次完整会诊，必须按顺序调用工具，禁止编造影像征象。\n"
    "1) 调用 list_patient_ct_scans，比较全部序列的检查日期与部位，明确选择最适合评估肺动脉栓塞、"
    "肺实质病变和肾上腺的一套，并在回复第一行写出序列 ID 与文件名。\n"
    "2) 对该序列调用 talk_to_ct，提问：是否存在肺栓塞或急性胸部病变？左肾上腺是否有结节及其大小？"
    "有无肺结节或占位？必须基于容积视觉分析作答，禁止套用 4.2mm / LU-RADS 2 模板。\n"
    "3) 调用 get_patient_records，核对吸烟史、慢性支气管炎、干咳胸闷是否与影像相符。\n"
    "4) 调用 get_segmentation_qc，核对肝脏等器官体积是否异常。\n"
    "5) 调用 draft_radiology_report，所见必须来自第 2 步 RadSight 原文。\n"
    "最后用中文给出：序列选择理由、影像结论、与病史一致性。"
)


def _request(method: str, url: str, *, token: str | None = None, body=None, timeout: float = 30.0):
    data = None
    headers = {"Accept": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if body is not None:
        data = json.dumps(body).encode()
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        raw = resp.read().decode()
        return json.loads(raw) if raw else {}


def login() -> str:
    payload = _request("POST", f"{BACKEND}/api/v1/auth/login", body={"username": USERNAME, "password": PASSWORD})
    return payload["data"]["access_token"]


def parse_sse(raw: str) -> list[dict]:
    events = []
    for line in raw.splitlines():
        line = line.strip()
        if not line.startswith("data: "):
            continue
        try:
            events.append(json.loads(line[6:]))
        except json.JSONDecodeError:
            continue
    return events


def stream_chat(token: str, conversation_id: str, message: str, timeout: float = 420.0) -> list[dict]:
    body = json.dumps(
        {
            "conversation_id": conversation_id,
            "patient_id": PATIENT_ID,
            "message": message,
        }
    ).encode()
    req = urllib.request.Request(
        f"{BACKEND}/api/v1/agent/chat/stream",
        data=body,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "text/event-stream",
        },
        method="POST",
    )
    chunks: list[str] = []
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        while True:
            line = resp.readline()
            if not line:
                break
            chunks.append(line.decode("utf-8", errors="replace"))
    return parse_sse("".join(chunks))


def score(events: list[dict], direct_radsight: dict) -> dict:
    tools_start = [e.get("tool") for e in events if e.get("type") == "tool_call_start"]
    tools_end = [e for e in events if e.get("type") == "tool_call_end"]
    text = "".join(e.get("delta", "") for e in events if e.get("type") == "text_delta")
    full = next((e.get("full_text") for e in events if e.get("type") == "done"), text)
    errors = [e.get("message") for e in events if e.get("type") == "error"]
    report_cards = [e.get("report") for e in events if e.get("type") == "report_card"]
    talk_end = next((e for e in tools_end if e.get("tool") == "talk_to_ct"), {})
    talk_result = talk_end.get("result") or {}
    blob = json.dumps(events, ensure_ascii=False) + "\n" + (full or "")
    checks = {
        "radsight_service_not_stub": direct_radsight.get("stub") is False and direct_radsight.get("loaded") is True,
        "radsight_direct_not_template": not any(n in (direct_radsight.get("raw_text") or "") for n in TEMPLATE_NEEDLES),
        "stream_completed": any(e.get("type") == "done" for e in events) and not errors,
        "called_list_ct": "list_patient_ct_scans" in tools_start,
        "called_talk_to_ct": "talk_to_ct" in tools_start,
        "talk_to_ct_not_stub": talk_result.get("stub") is False or (
            "talk_to_ct" in tools_start and not any(n in blob for n in ("4.2mm", "LU-RADS 2 类"))
        ),
        "no_template_fingerprint": not all(n in (full or "") for n in ("4.2mm", "LU-RADS")),
        "called_records": "get_patient_records" in tools_start,
        "called_qc": "get_segmentation_qc" in tools_start,
        "called_report": "draft_radiology_report" in tools_start or bool(report_cards),
        "mentions_series": any(e.get("type") == "series_selected" for e in events) or "img_demo" in (full or ""),
    }
    p0 = [
        "radsight_service_not_stub",
        "radsight_direct_not_template",
        "stream_completed",
        "called_talk_to_ct",
        "no_template_fingerprint",
    ]
    passed_p0 = all(checks[name] for name in p0)
    return {
        "passed_p0": passed_p0,
        "checks": checks,
        "tools_start": tools_start,
        "errors": errors,
        "talk_result": talk_result,
        "report_cards": report_cards,
        "full_text": full,
        "event_types": [e.get("type") for e in events],
    }


def main() -> int:
    report: dict = {"ts": time.time(), "patient_id": PATIENT_ID}
    health = _request("GET", f"{RADSIGHT}/health", timeout=5)
    report["radsight_health"] = health
    print("radsight", json.dumps(health, ensure_ascii=False))
    if health.get("status") != "ready" or health.get("stub") or not health.get("loaded"):
        print("FAIL: RadSight is not ready for a real-model E2E")
        Path("/tmp/radsight_e2e_hard.json").write_text(json.dumps(report, ensure_ascii=False, indent=2))
        return 2

    token = login()
    scans = _request("GET", f"{BACKEND}/api/v1/agent/internal/patients/{PATIENT_ID}/ct_scans", token=token)
    report["ct_scans"] = scans
    print("ct_scans", json.dumps(scans, ensure_ascii=False)[:800])
    if not scans:
        print("FAIL: no CT scans for patient")
        return 2
    missing = [s["file_path"] for s in scans if not Path(s["file_path"]).exists()]
    report["missing_paths"] = missing
    if missing:
        print("FAIL: CT paths do not exist on disk:", missing)
        return 2

    target = scans[0]["file_path"]
    print("direct talk_to_ct", target)
    direct = _request(
        "POST",
        f"{RADSIGHT}/v1/vision/talk_to_ct",
        body={
            "ct_path": target,
            "question": (
                "Does this CT show pulmonary embolism or acute chest findings? "
                "Is there an adrenal nodule? Any pulmonary nodules? Answer from the volume."
            ),
            "patient_context": {"name": "demo_patient", "age": 46, "gender": "male", "symptoms": "干咳胸闷"},
        },
        timeout=300,
    )
    report["direct_talk_to_ct"] = {
        "stub": direct.get("stub"),
        "quant": direct.get("quant"),
        "latency_ms": direct.get("latency_ms"),
        "raw_text": direct.get("raw_text"),
    }
    print("direct stub", direct.get("stub"), "quant", direct.get("quant"), "latency", direct.get("latency_ms"))
    print("direct text:", (direct.get("raw_text") or "")[:400])

    conv = _request(
        "POST",
        f"{BACKEND}/api/v1/agent/conversations",
        token=token,
        body={"patient_id": PATIENT_ID, "title": "高难度端到端会诊实测"},
    )["data"]
    report["conversation_id"] = conv["id"]
    print("conversation", conv["id"])
    print("streaming hard prompt via agent SSE...")
    started = time.perf_counter()
    try:
        events = stream_chat(token, conv["id"], HARD_PROMPT, timeout=480)
        report["stream_error"] = None
    except Exception as exc:
        events = []
        report["stream_error"] = str(exc)
        print("stream exception:", exc)
    report["stream_latency_ms"] = int((time.perf_counter() - started) * 1000)
    report["events"] = events
    scored = score(events, direct)
    report["score"] = {k: v for k, v in scored.items() if k != "full_text"}
    report["full_text"] = scored["full_text"]
    out = Path("/tmp/radsight_e2e_hard.json")
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2))
    print("tools", scored["tools_start"])
    print("checks", json.dumps(scored["checks"], ensure_ascii=False, indent=2))
    print("errors", scored["errors"])
    print("full_text:\n", (scored["full_text"] or "")[:2000])
    print("wrote", out)
    print("P0", "PASS" if scored["passed_p0"] else "FAIL", "latency_ms", report["stream_latency_ms"])
    return 0 if scored["passed_p0"] else 1


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        print("HTTPError", exc.code, body[:2000])
        raise
