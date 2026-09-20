"""
Step 2: Crop non-zero region, pad to target size, and save.

This script crops CT images and masks to the non-zero bounding box region
(with a safety margin), then pads to the target size (96, 256, 384).

Usage:
    python data_process/2_crop_pad.py \
        --image_json path/to/resized_image_paths.json \
        --output_dir path/to/output \
        --target_size 96 256 384 \
        --hu_min -1000 --hu_max 1000 \
        --workers 64
"""

import os
import json
import argparse
import numpy as np
import torch
from pathlib import Path
from functools import partial
from concurrent.futures import ProcessPoolExecutor
from monai import transforms
from tqdm import tqdm


def process_image(loader, target_size, output_dir, path_pair):
    """
    Crop non-zero region from image/mask, pad to target size, and save.

    Args:
        loader: MONAI transform pipeline for loading.
        target_size: Target spatial size (D, H, W).
        output_dir: Root output directory.
        path_pair: (image_path, mask_path).
    """
    try:
        img_path, mask_path = path_pair

        data = loader({"image": img_path, "label": mask_path})

        image = data["image"]
        label = data["label"]

        old_unique_organ_ids = label.unique()

        roi_coords = np.nonzero(label[0])
        min_dhw = torch.from_numpy(np.min(roi_coords, axis=1))
        max_dhw = torch.from_numpy(np.max(roi_coords, axis=1))

        extend_d = 5
        extend_hw = 20

        min_dhw = torch.maximum(
            min_dhw - torch.tensor([extend_d, extend_hw, extend_hw]),
            torch.tensor([0, 0, 0]),
        )
        max_dhw = torch.minimum(
            max_dhw + torch.tensor([extend_d, extend_hw, extend_hw]),
            torch.tensor([image.shape[1], image.shape[2], image.shape[3]]),
        )

        data["image"] = image[
            :, min_dhw[0]:max_dhw[0], min_dhw[1]:max_dhw[1], min_dhw[2]:max_dhw[2]
        ]
        data["label"] = label[
            :, min_dhw[0]:max_dhw[0], min_dhw[1]:max_dhw[1], min_dhw[2]:max_dhw[2]
        ]

        new_unique_organ_ids = data["label"].unique()
        assert torch.all(old_unique_organ_ids == new_unique_organ_ids), \
            f"Organ IDs changed after cropping: {old_unique_organ_ids} -> {new_unique_organ_ids}"

        patient_id = Path(img_path).parent.name

        saver = transforms.Compose([
            transforms.SpatialPadd(
                keys=["image"],
                spatial_size=target_size,
                mode="constant",
                constant_values=0,
            ),
            transforms.SpatialPadd(
                keys=["label"],
                spatial_size=target_size,
                mode="constant",
                constant_values=0,
            ),
            transforms.SaveImaged(
                output_dir=os.path.join(output_dir, "processed_images", patient_id),
                keys=["image"],
                output_postfix="",
                separate_folder=False,
                resample=False,
            ),
            transforms.SaveImaged(
                output_dir=os.path.join(output_dir, "processed_masks", patient_id),
                keys=["label"],
                output_postfix="",
                separate_folder=False,
                resample=False,
            ),
        ])

        saver(data)

    except Exception as e:
        print(f"[ERROR] {img_path}: {e}")
        return None


def main():
    parser = argparse.ArgumentParser(description="Step 2: Crop and pad CT images/masks to target size.")
    parser.add_argument("--image_json", type=str, required=True, help="JSON file containing list of resized image paths.")
    parser.add_argument("--output_dir", type=str, required=True, help="Root output directory.")
    parser.add_argument("--target_size", type=int, nargs=3, default=[96, 256, 384], help="Target spatial size (D H W).")
    parser.add_argument("--hu_min", type=float, default=-1000, help="Min HU value for intensity clipping.")
    parser.add_argument("--hu_max", type=float, default=1000, help="Max HU value for intensity clipping.")
    parser.add_argument("--workers", type=int, default=64, help="Number of parallel workers.")
    args = parser.parse_args()

    image_paths = json.load(open(args.image_json))

    path_pairs = []
    for path in image_paths:
        mask_path = path.replace("resized_images", "resized_masks") \
                        .replace("ct.nii.gz", "merged_mask.nii.gz")
        path_pairs.append((path, mask_path))

    print(f"Total samples: {len(path_pairs)}")

    loader = transforms.Compose([
        transforms.LoadImaged(
            keys=["image", "label"],
            image_only=True,
            ensure_channel_first=True,
        ),
        transforms.Transposed(
            keys=["image", "label"],
            indices=(0, 3, 2, 1),
        ),
        transforms.ScaleIntensityRanged(
            keys=["image"],
            a_min=args.hu_min, a_max=args.hu_max,
            b_min=0.0, b_max=1.0,
            clip=True,
        ),
    ])

    func = partial(process_image, loader, tuple(args.target_size), args.output_dir)

    with ProcessPoolExecutor(max_workers=args.workers) as executor:
        list(tqdm(
            executor.map(func, path_pairs),
            total=len(path_pairs),
            desc="Cropping & Padding",
        ))

    print("Done!")


if __name__ == "__main__":
    main()
