"""
Step 1: Merge masks and resample CT images + masks to reference spacing.

This script resamples CT images and their corresponding segmentation masks
to a unified reference spacing (1.0, 1.0, 5.0) mm for standardized processing.

Usage:
    python data_process/1_merge_mask_resize.py \
        --image_json path/to/image_paths.json \
        --mask_json path/to/mask_paths.json \
        --output_dir path/to/output \
        --workers 16
"""

import os
import json
import argparse
import numpy as np
from pathlib import Path
from concurrent.futures import ProcessPoolExecutor
from monai import transforms
from tqdm import tqdm


REF_SPACING = (1.0, 1.0, 5.0)


def process_image_and_mask(args_tuple):
    """
    Resample a CT image and its mask to the reference spacing.

    Args:
        args_tuple: (image_path, mask_path, output_dir)
    """
    image_path, mask_path, output_dir = args_tuple

    try:
        image_res = transforms.LoadImaged(
            keys=["image"], image_only=False, ensure_channel_first=True
        )({"image": image_path})

        image = image_res["image"]
        affine = image_res["image_meta_dict"]["affine"]

        spacing = (
            abs(affine[0, 0].item()),
            abs(affine[1, 1].item()),
            abs(affine[2, 2].item()),
        )
        _, h, w, d = image.shape

        scale = [spacing[i] / REF_SPACING[i] for i in range(3)]
        target_size = [int(h * scale[1]), int(w * scale[0]), int(d * scale[2])]

        patient_id = Path(image_path).parent.name

        image_output_dir = os.path.join(output_dir, "resized_images", patient_id)
        image_trans = transforms.Compose([
            transforms.Resized(
                spatial_size=target_size,
                keys=["image"],
                mode="trilinear",
            ),
            transforms.SaveImaged(
                output_dir=image_output_dir,
                keys=["image"],
                output_postfix="",
                separate_folder=False,
                resample=False,
            ),
        ])
        image_trans(image_res)

        mask_res = transforms.LoadImaged(
            keys=["mask"], image_only=False, ensure_channel_first=True
        )({"mask": mask_path})

        mask_output_dir = os.path.join(output_dir, "resized_masks", patient_id)
        mask_trans = transforms.Compose([
            transforms.Resized(
                spatial_size=target_size,
                keys=["mask"],
                mode="nearest",
            ),
            transforms.SaveImaged(
                output_dir=mask_output_dir,
                keys=["mask"],
                output_postfix="",
                separate_folder=False,
                resample=False,
            ),
        ])
        mask_trans(mask_res)

    except Exception as e:
        print(f"[ERROR] Failed to process: {image_path}")
        print(f"        {e}")
        return None


def main():
    parser = argparse.ArgumentParser(description="Step 1: Resample CT images and masks to reference spacing.")
    parser.add_argument("--image_json", type=str, required=True, help="JSON file containing list of CT image paths.")
    parser.add_argument("--mask_json", type=str, required=True, help="JSON file containing list of mask paths.")
    parser.add_argument("--output_dir", type=str, required=True, help="Root output directory.")
    parser.add_argument("--workers", type=int, default=16, help="Number of parallel workers.")
    args = parser.parse_args()

    all_images = json.load(open(args.image_json))
    all_masks = json.load(open(args.mask_json))

    patient_image_map = {}
    for path in all_images:
        patient_id = Path(path).parent.name
        patient_image_map[patient_id] = path

    path_tuples = []
    missing = []
    for mask_path in sorted(all_masks):
        patient_id = Path(mask_path).parent.name
        if patient_id not in patient_image_map:
            print(f"[WARN] No matching CT found for: {patient_id}")
            missing.append(mask_path)
            continue
        image_path = patient_image_map[patient_id]
        path_tuples.append((image_path, mask_path, args.output_dir))

    print(f"Total pairs: {len(path_tuples)}, Missing: {len(missing)}")

    with ProcessPoolExecutor(max_workers=args.workers) as executor:
        list(tqdm(
            executor.map(process_image_and_mask, path_tuples),
            total=len(path_tuples),
            desc="Resampling",
        ))

    print("Done!")


if __name__ == "__main__":
    main()
