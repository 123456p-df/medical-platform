"""
Distributed inference script with yes/no logits extraction for RadSight.

Extends multi_infer.py by additionally extracting yes/no logits and probabilities
from the first generated token, useful for computing AUC on binary VQA tasks.

Usage:
    torchrun --nproc_per_node=4 --nnodes=1 --node_rank=0 \
        --master_addr=localhost --master_port=12349 \
        scripts/eval/multi_infer_logits.py \
        --model-path path/to/checkpoint \
        --input-json path/to/test_data.json \
        --output-json path/to/results.json
"""

import sys
import os
import os.path as osp

sys.path.append(os.path.join(os.path.dirname(__file__), '../..'))

import json
import random
import traceback
import datetime
import argparse

import numpy as np
import torch
import torch.distributed as dist
from torch.utils.data import Dataset, DataLoader
from torch.utils.data.distributed import DistributedSampler
from tqdm import tqdm

from radsight.model import load_pretrained_model
from radsight.mm_utils import load_images, get_model_name_from_path, load_3D
from radsight.model.processor import RadSightProcessor


def setup_distributed():
    is_distributed = (
        "RANK" in os.environ
        and "WORLD_SIZE" in os.environ
        and "LOCAL_RANK" in os.environ
    )

    if is_distributed:
        dist.init_process_group(
            backend="nccl",
            timeout=datetime.timedelta(minutes=120),
        )
        local_rank = int(os.environ["LOCAL_RANK"])
        global_rank = dist.get_rank()
        world_size = dist.get_world_size()
    else:
        os.environ.setdefault("RANK", "0")
        os.environ.setdefault("WORLD_SIZE", "1")
        os.environ.setdefault("LOCAL_RANK", "0")
        os.environ.setdefault("MASTER_ADDR", "localhost")
        os.environ.setdefault("MASTER_PORT", "29500")

        dist.init_process_group(
            backend="gloo",
            timeout=datetime.timedelta(minutes=120),
        )
        local_rank = 0
        global_rank = 0
        world_size = 1

    return local_rank, global_rank, world_size


def parse_args():
    parser = argparse.ArgumentParser(description="RadSight distributed inference with logits extraction.")
    parser.add_argument("--model-path", "--model_path", type=str, required=True)
    parser.add_argument("--input-json", "--input_json", type=str, required=True,
                        help="Path to test data JSON file.")
    parser.add_argument("--output-json", "--output_json", type=str, required=True,
                        help="Path to save inference results.")
    parser.add_argument("--num-workers", "--num_workers", type=int, default=4)
    parser.add_argument("--max-new-tokens", "--max_new_tokens", type=int, default=8192)
    parser.add_argument("--temperature", type=float, default=0.6)
    parser.add_argument("--do-sample", action="store_true", default=False)
    parser.add_argument("--num-frames", "--num_frames", type=int, default=12,
                        help="Number of frames for volume modality.")
    return parser.parse_args()


def seed_everything(seed: int = 42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)


def detect_modal(sample: dict) -> str:
    if sample.get("volume") and len(sample["volume"]) > 0:
        return "volume"
    if sample.get("image") and len(sample["image"]) > 0:
        return "image"
    for conv in sample.get("conversations", []):
        if conv.get("from") == "human":
            val = conv.get("value", "")
            if "<volume>" in val:
                return "volume"
            if "<image>" in val:
                return "image"
    return "text"


def build_conversation(sample: dict, modal: str, num_frames: int = 6) -> list:
    conversation = []
    for conv in sample.get("conversations", []):
        if conv["from"] != "human":
            continue
        raw_text = conv["value"]
        raw_text = raw_text.replace("<volume>\n", "").replace("<volume>", "")
        raw_text = raw_text.replace("<image>\n", "").replace("<image>", "")
        raw_text = raw_text.strip()

        content = []
        if modal == "volume":
            content.append({"type": "video", "num_frames": num_frames})
        elif modal == "image":
            content.append({"type": "image"})
        content.append({"type": "text", "text": raw_text})

        conversation.append({"role": "user", "content": content})
    return conversation


def load_media(sample: dict, modal: str):
    if modal == "volume":
        slices = load_3D(sample["volume"][0])
        return slices["image"]
    elif modal == "image":
        return load_images(sample["image"])
    return None


def get_gt(sample: dict) -> str:
    for conv in sample.get("conversations", []):
        if conv.get("from") == "gpt":
            return conv.get("value", "")
    return ""


def get_question(sample: dict) -> str:
    for conv in sample.get("conversations", []):
        if conv.get("from") == "human":
            val = conv.get("value", "")
            val = val.replace("<volume>\n", "").replace("<volume>", "")
            val = val.replace("<image>\n", "").replace("<image>", "")
            return val.strip()
    return ""


class MedicalVQADataset(Dataset):
    def __init__(self, data: list, processor: RadSightProcessor, num_frames: int = 6):
        self.data = data
        self.processor = processor
        self.num_frames = num_frames

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        sample = self.data[idx]
        modal = detect_modal(sample)

        try:
            media = load_media(sample, modal)
        except Exception as e:
            return {
                "id": sample.get("id", idx),
                "modal": modal,
                "question": get_question(sample),
                "ground_truth": get_gt(sample),
                "answer_type": sample.get("answer_type", ""),
                "error": f"[load_media error] {e}",
                "inputs": None,
            }

        conversation = build_conversation(sample, modal, self.num_frames)
        try:
            inputs = self.processor(
                images=[media] if modal != "text" else None,
                text=conversation,
                merge_size=2 if modal == "video" else 1,
                modal=modal,
                return_tensors="pt",
            )
        except Exception as e:
            return {
                "id": sample.get("id", idx),
                "modal": modal,
                "question": get_question(sample),
                "ground_truth": get_gt(sample),
                "answer_type": sample.get("answer_type", ""),
                "error": f"[processor error] {e}",
                "inputs": None,
            }

        return {
            "id": sample.get("id", idx),
            "modal": modal,
            "question": get_question(sample),
            "ground_truth": get_gt(sample),
            "answer_type": sample.get("answer_type", ""),
            "error": None,
            "inputs": inputs,
        }


def collate_fn(batch):
    return batch[0]


def get_yes_no_token_ids(tokenizer):
    yes_ids, no_ids = [], []
    for w in ["yes"]:
        ids = tokenizer.encode(w, add_special_tokens=False)
        if len(ids) == 1:
            yes_ids.append(ids[0])
    for w in ["no"]:
        ids = tokenizer.encode(w, add_special_tokens=False)
        if len(ids) == 1:
            no_ids.append(ids[0])

    yes_ids = list(set(yes_ids))
    no_ids = list(set(no_ids))
    print(f"[Yes token ids]: {yes_ids} -> {[tokenizer.decode([i]) for i in yes_ids]}")
    print(f"[No  token ids]: {no_ids}  -> {[tokenizer.decode([i]) for i in no_ids]}")
    return yes_ids, no_ids


def run_inference(model, tokenizer, batch, device, args, yes_ids, no_ids):
    inputs = batch["inputs"]
    inputs = {
        k: v.to(device) if isinstance(v, torch.Tensor) else v
        for k, v in inputs.items()
    }
    if "pixel_values" in inputs:
        inputs["pixel_values"] = inputs["pixel_values"].to(torch.bfloat16)

    with torch.inference_mode():
        output = model.generate(
            **inputs,
            do_sample=args.do_sample,
            modals=[batch["modal"]],
            temperature=args.temperature,
            max_new_tokens=args.max_new_tokens,
            use_cache=True,
            pad_token_id=tokenizer.eos_token_id,
            output_scores=True,
            return_dict_in_generate=True,
        )

    prediction = tokenizer.batch_decode(
        output.sequences, skip_special_tokens=True
    )[0].strip()

    first_token_logits = output.scores[0][0]

    yes_logit = max(first_token_logits[tid].item() for tid in yes_ids) if yes_ids else float('nan')
    no_logit = max(first_token_logits[tid].item() for tid in no_ids) if no_ids else float('nan')

    logits_pair = torch.tensor([yes_logit, no_logit], dtype=torch.float32)
    probs_pair = torch.softmax(logits_pair, dim=0)
    yes_prob = probs_pair[0].item()
    no_prob = probs_pair[1].item()

    return {
        "prediction": prediction,
        "yes_logit": round(yes_logit, 4),
        "no_logit": round(no_logit, 4),
        "yes_prob": round(yes_prob, 6),
        "no_prob": round(no_prob, 6),
    }


def main():
    local_rank, global_rank, world_size = setup_distributed()
    device = torch.device(f"cuda:{local_rank}")
    torch.cuda.set_device(local_rank)

    seed_everything()
    args = parse_args()

    if global_rank == 0:
        print(f"Loading model from {args.model_path} ...")
    model_name = get_model_name_from_path(args.model_path)
    tokenizer, model, image_processor, _ = load_pretrained_model(
        args.model_path, None, model_name,
        device_map={"": f"cuda:{local_rank}"},
    )
    model.config.use_token_compression = False
    model.eval()
    processor = RadSightProcessor(image_processor, tokenizer)
    if global_rank == 0:
        print("Model loaded.\n")

    yes_ids, no_ids = get_yes_no_token_ids(tokenizer)

    with open(args.input_json, "r", encoding="utf-8") as f:
        all_data = json.load(f)

    dataset = MedicalVQADataset(all_data, processor, num_frames=args.num_frames)
    sampler = DistributedSampler(
        dataset, num_replicas=world_size, rank=global_rank,
        shuffle=False, drop_last=False,
    )
    dataloader = DataLoader(
        dataset, batch_size=1, sampler=sampler,
        num_workers=args.num_workers, collate_fn=collate_fn, pin_memory=False,
    )

    local_results = []
    for batch in tqdm(dataloader, desc=f"Rank {global_rank}/{world_size}",
                      position=local_rank, disable=(global_rank != 0)):
        sample_id = batch["id"]

        if batch["error"] is not None:
            local_results.append({
                "id": sample_id,
                "modal": batch["modal"],
                "question": batch["question"],
                "ground_truth": batch["ground_truth"],
                "answer_type": batch["answer_type"],
                "prediction": batch["error"],
                "yes_logit": None, "no_logit": None,
                "yes_prob": None, "no_prob": None,
            })
            print(f"[WARN] rank={global_rank} id={sample_id} error: {batch['error']}")
            continue

        try:
            result = run_inference(model, tokenizer, batch, device, args, yes_ids, no_ids)
        except Exception as e:
            traceback.print_exc()
            result = {
                "prediction": f"[generate error] {e}",
                "yes_logit": None, "no_logit": None,
                "yes_prob": None, "no_prob": None,
            }

        local_results.append({
            "id": sample_id,
            "modal": batch["modal"],
            "question": batch["question"],
            "ground_truth": batch["ground_truth"],
            "answer_type": batch["answer_type"],
            **result,
        })

        if global_rank == 0:
            tqdm.write(
                f"[id={sample_id}] GT: {batch['ground_truth']!r} | "
                f"Pred: {result['prediction']!r} | "
                f"yes_logit={result['yes_logit']}  no_logit={result['no_logit']}  "
                f"yes_prob={result['yes_prob']}"
            )

    del model
    torch.cuda.empty_cache()

    gathered = [None] * world_size
    dist.gather_object(
        obj=local_results,
        object_gather_list=gathered if global_rank == 0 else None,
        dst=0,
    )

    if global_rank == 0:
        all_results = sorted(sum(gathered, []), key=lambda x: x["id"])
        seen, dedup_results = set(), []
        for r in all_results:
            if r["id"] not in seen:
                seen.add(r["id"])
                dedup_results.append(r)

        os.makedirs(osp.dirname(osp.abspath(args.output_json)), exist_ok=True)
        with open(args.output_json, "w", encoding="utf-8") as f:
            json.dump(dedup_results, f, ensure_ascii=False, indent=2)

        print(f"\nDone! {len(dedup_results)} samples saved to {args.output_json}")

    dist.barrier()
    dist.destroy_process_group()


if __name__ == "__main__":
    main()
