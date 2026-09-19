#!/bin/bash
# Single-node multi-GPU inference
#
# Usage:
#   bash scripts/eval/infer_one_node.sh

torchrun \
    --nproc_per_node=${NPROC_PER_NODE:-2} \
    --master_port=29500 \
    scripts/eval/multi_infer.py \
    --model-path ${MODEL_PATH:-"path/to/checkpoint"} \
    --input-json ${INPUT_JSON:-"path/to/test_data.json"} \
    --output-json ${OUTPUT_JSON:-"path/to/results.json"} \
    --do-sample False
