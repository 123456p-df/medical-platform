#!/bin/bash
# Multi-node multi-GPU inference
#
# Required environment variables:
#   MASTER_ADDR, MASTER_PORT, NPROC_PER_NODE, WORLD_SIZE, RANK
#
# Usage:
#   # Node 0 (master)
#   MASTER_ADDR=<ip> MASTER_PORT=12349 NPROC_PER_NODE=4 WORLD_SIZE=2 RANK=0 \
#     bash scripts/eval/infer_multi_node.sh
#
#   # Node 1
#   MASTER_ADDR=<ip> MASTER_PORT=12349 NPROC_PER_NODE=4 WORLD_SIZE=2 RANK=1 \
#     bash scripts/eval/infer_multi_node.sh

torchrun \
    --master_addr=$MASTER_ADDR \
    --master_port=$MASTER_PORT \
    --nproc_per_node=$NPROC_PER_NODE \
    --nnodes=$WORLD_SIZE \
    --node_rank=$RANK \
    --rdzv-conf=timeout=36000 \
    scripts/eval/multi_infer.py \
    --model-path ${MODEL_PATH:-"path/to/checkpoint"} \
    --input-json ${INPUT_JSON:-"path/to/test_data.json"} \
    --output-json ${OUTPUT_JSON:-"path/to/results.json"} \
    --do-sample False
