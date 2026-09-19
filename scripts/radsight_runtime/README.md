# RadSight-8B local runtime

Apple Silicon inference adapter for `talk_to_ct`.

1. `bash scripts/radsight_runtime/setup_env.sh` — creates `.venv-radsight` and downloads `VL3-SigLIP-NaViT`.
2. Weights stay at `$RADSIGHT_MODEL_PATH` (default `/Users/allenyuan/modilify_app/RadSight-8B`).
3. `.venv-radsight/bin/python scripts/radsight_runtime/smoke_infer.py --ct /path/to/scan.nii.gz`
4. Preview startup launches `scripts/radsight_service.py` on port 8001 with this interpreter.

`RADSIGHT_QUANT=int8` (default) weight-only quantizes the language backbone via torchao and keeps 2D/3D vision towers in BF16. Set `RADSIGHT_QUANT=none` to skip quantization. Production Talk-to-CT never falls back to the old template report.
