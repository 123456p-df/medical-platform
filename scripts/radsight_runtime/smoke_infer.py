#!/usr/bin/env python3
"""Load RadSight-8B and run one 3D CT question. Prints model text, not the stub template."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))

from radsight_runtime.env import load_settings  # noqa: E402
from radsight_runtime.infer import generate_volume_answer  # noqa: E402
from radsight_runtime.loader import load_radsight  # noqa: E402
from radsight_runtime.volume import looks_like_stub_template  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--ct",
        default=".cache/preview/medical-data/medical-images/img_demo_0001.nii.gz",
        help="Path to a NIfTI CT volume",
    )
    parser.add_argument(
        "--question",
        default="Please generate a radiology report for this CT scan.",
    )
    args = parser.parse_args()

    settings = load_settings()
    print(f"device={settings.device} quant={settings.quant} weights={settings.model_path}")
    bundle = load_radsight(settings)
    print(f"loaded quant={bundle.quant} cache_hit={bundle.quant_cache_hit} attn={bundle.attn}")
    result = generate_volume_answer(
        bundle,
        args.ct,
        args.question,
        max_new_tokens=settings.max_new_tokens,
        num_frames=settings.num_frames,
    )
    text = result["raw_text"]
    print(f"latency_ms={result['latency_ms']}")
    print(text)
    if looks_like_stub_template(text):
        print("ERROR: output still matches the old stub template", file=sys.stderr)
        return 2
    if not text.strip():
        print("ERROR: empty model output", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
