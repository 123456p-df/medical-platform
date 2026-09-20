# RadSight-8B local runtime

Apple Silicon inference adapter for `talk_to_ct`.

1. `bash scripts/radsight_runtime/setup_env.sh` — creates `.venv-radsight` and downloads `VL3-SigLIP-NaViT`.
2. Weights stay at `$RADSIGHT_MODEL_PATH` (default `/Users/allenyuan/modilify_app/RadSight-8B`).
3. `.venv-radsight/bin/python scripts/radsight_runtime/smoke_infer.py --ct /path/to/scan.nii.gz`
4. Preview startup launches `scripts/radsight_service.py` on port 8001 with this interpreter.

`RADSIGHT_QUANT=int8` (default) weight-only quantizes the language backbone via torchao and keeps 2D/3D vision towers in BF16. Set `RADSIGHT_QUANT=none` to skip quantization. Production Talk-to-CT never falls back to the old template report.

On Apple Silicon the local service defaults to `RADSIGHT_NUM_FRAMES=12` and
`RADSIGHT_MAX_NEW_TOKENS=512` to keep MPS generation latency bounded. The
processor currently requires the 12-frame image-token contract, so keep that
value unless the model processor is changed together with it. The previous
high-latency generation configuration is `RADSIGHT_MAX_NEW_TOKENS=2048`.

Preprocessed CT volumes are cached by path, size, and modification time for fast
follow-up questions. `RADSIGHT_VOLUME_CACHE_ENTRIES=2` controls the bounded CPU
cache; set it to `0` to disable it. `/health` reports cache hits and misses, and
Talk-to-CT responses include per-stage timings for profiling.
