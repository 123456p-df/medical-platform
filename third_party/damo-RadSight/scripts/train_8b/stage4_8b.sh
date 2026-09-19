#!/bin/bash
# Environment Variables
ARG_WORLD_SIZE=${1:-1}
ARG_NPROC_PER_NODE=${2:-1}
ARG_MASTER_ADDR="127.0.0.1"
ARG_MASTER_PORT=16667
ARG_RANK=0

# Multiple conditions
if [ ! -n "$WORLD_SIZE" ] || [ ! -n "$NPROC_PER_NODE" ]; then
    WORLD_SIZE=$ARG_WORLD_SIZE
    NPROC_PER_NODE=$ARG_NPROC_PER_NODE
fi
if [ ! -n "$MASTER_ADDR" ] || [ ! -n "$MASTER_PORT" ] || [ ! -n "$RANK" ]; then
    MASTER_ADDR=$ARG_MASTER_ADDR
    MASTER_PORT=$ARG_MASTER_PORT
    RANK=$ARG_RANK
fi

echo "WORLD_SIZE: $WORLD_SIZE"
echo "NPROC_PER_NODE: $NPROC_PER_NODE"

# Training Arguments
GLOBAL_BATCH_SIZE=512
LOCAL_BATCH_SIZE=4
GRADIENT_ACCUMULATION_STEPS=$[$GLOBAL_BATCH_SIZE/($WORLD_SIZE*$NPROC_PER_NODE*$LOCAL_BATCH_SIZE)]
echo $GRADIENT_ACCUMULATION_STEPS

# Log Arguments
export WANDB_PROJECT=radsight_qwen3_vl_8b
RUN_NAME=stage_4_vison_projector_llm_mrg
OUTP_DIR=output

torchrun --nnodes $WORLD_SIZE \
    --nproc_per_node $NPROC_PER_NODE \
    --master_addr=$MASTER_ADDR \
    --master_port=$MASTER_PORT \
    --node_rank $RANK \
    --rdzv-conf=join_timeout=36000 \
    radsight/train.py \
    --deepspeed scripts/zero1.json \
    --model_type radsight_qwen3 \
    --model_path ${MODEL_PATH:-"output/stage3/checkpoint"} \
    --vision_encoder ${VISION_ENCODER:-"DAMO-NLP-SG/VL3-SigLIP-NaViT"} \
    --mm_projector_type mlp2x_gelu \
    --mm_projector_type_3d spp \
    --mm_vision_hidden_size 1152 \
    --mm_vision_embed_dim 1152 \
    --data_path ${DATA_PATH:-"path/to/stage4_train_data.json"} \
    --image_merge_size 1 \
    --video_merge_size 2 \
    --model_max_length 16384 \
    --mm_max_length 10240 \
    --bf16 True \
    --tf32 True \
    --fp16 False \
    --output_dir ${OUTP_DIR}/${WANDB_PROJECT}/${RUN_NAME} \
    --num_train_epochs 2 \
    --per_device_train_batch_size $LOCAL_BATCH_SIZE \
    --per_device_eval_batch_size 4 \
    --gradient_accumulation_steps $GRADIENT_ACCUMULATION_STEPS \
    --evaluation_strategy "no" \
    --save_strategy "steps" \
    --save_steps 1000 \
    --save_total_limit 2 \
    --llm_lr 1e-5 \
    --mm_projector_lr 1e-5 \
    --vision_encoder_lr 2e-6 \
    --vision_encoder_3d_lr 2e-6 \
    --mm_projector_3d_lr 1e-5 \
    --weight_decay 0. \
    --warmup_ratio 0.03 \
    --lr_scheduler_type "cosine" \
    --logging_steps 1 \
    --gradient_checkpointing True \
    --dataloader_num_workers 16 \
    --report_to swanlab \
    --run_name $RUN_NAME
