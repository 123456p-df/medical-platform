"""
Step 0: Generate segmentation masks for CT volumes using TotalSegmentator.

For CT volumes that do not have pre-existing segmentation masks, this script
uses TotalSegmentator to automatically generate organ segmentation masks.
The generated masks can then be used as input for Step 1 (resample) and Step 2 (crop & pad).

Requirements:
    pip install TotalSegmentator

Usage:
    # Generate masks from a directory of NIfTI files
    python data_process/0_generate_mask.py \
        --input_dir path/to/ct_volumes \
        --output_dir path/to/output_masks \
        --workers 4

    # Generate masks from a metadata CSV file
    python data_process/0_generate_mask.py \
        --metadata_csv path/to/metadata.csv \
        --data_root path/to/data_root \
        --output_dir path/to/output_masks \
        --split train \
        --workers 4
"""

import os
import json
import argparse
from pathlib import Path
from concurrent.futures import ProcessPoolExecutor

import nibabel as nib
from tqdm import tqdm


def generate_mask_from_path(args_tuple):
    """
    Generate a segmentation mask for a single CT volume.

    Args:
        args_tuple: (input_path, output_path)
    """
    input_path, output_path = args_tuple

    try:
        from totalsegmentator.python_api import totalsegmentator

        input_img = nib.load(input_path)
        output_img = totalsegmentator(input_img, quiet=True)

        Path(os.path.dirname(output_path)).mkdir(parents=True, exist_ok=True)
        nib.save(output_img, output_path)

    except Exception as e:
        print(f"[ERROR] Failed to process: {input_path}")
        print(f"        {e}")
        return None


def collect_from_directory(input_dir, output_dir):
    """Collect (input, output) pairs from a directory of NIfTI files."""
    path_pairs = []
    for root, _, files in os.walk(input_dir):
        for f in sorted(files):
            if f.endswith((".nii.gz", ".nii")):
                input_path = os.path.join(root, f)
                rel_path = os.path.relpath(input_path, input_dir)
                output_path = os.path.join(output_dir, rel_path)
                path_pairs.append((input_path, output_path))
    return path_pairs


def collect_from_csv(metadata_csv, data_root, output_dir, split):
    """Collect (input, output) pairs from a metadata CSV file."""
    import pandas as pd

    d = "validation" if split == "valid" else split
    metadata = pd.read_csv(metadata_csv)
    path_pairs = []

    for _, row in metadata.iterrows():
        volume_name = row["VolumeName"]
        dir1 = volume_name.rsplit("_", 1)[0]
        dir2 = volume_name.rsplit("_", 2)[0]

        input_path = os.path.join(data_root, f"{split}_fixed", dir2, dir1, volume_name)
        output_path = os.path.join(output_dir, dir2, dir1, volume_name)
        path_pairs.append((input_path, output_path))

    return path_pairs


def main():
    parser = argparse.ArgumentParser(
        description="Step 0: Generate segmentation masks using TotalSegmentator."
    )
    parser.add_argument("--input_dir", type=str, default=None,
                        help="Directory containing CT NIfTI files. Used when --metadata_csv is not provided.")
    parser.add_argument("--metadata_csv", type=str, default=None,
                        help="Path to metadata CSV file (alternative to --input_dir).")
    parser.add_argument("--data_root", type=str, default=None,
                        help="Root data directory (used with --metadata_csv).")
    parser.add_argument("--output_dir", type=str, required=True,
                        help="Output directory for generated masks.")
    parser.add_argument("--split", type=str, default="train",
                        help="Data split: train / valid / test (used with --metadata_csv).")
    parser.add_argument("--workers", type=int, default=4,
                        help="Number of parallel workers.")
    args = parser.parse_args()

    if args.metadata_csv is not None:
        assert args.data_root is not None, "--data_root is required when using --metadata_csv"
        path_pairs = collect_from_csv(args.metadata_csv, args.data_root, args.output_dir, args.split)
    elif args.input_dir is not None:
        path_pairs = collect_from_directory(args.input_dir, args.output_dir)
    else:
        raise ValueError("Either --input_dir or --metadata_csv must be provided.")

    # Skip already processed files
    skip_count = 0
    filtered_pairs = []
    for inp, out in path_pairs:
        if os.path.exists(out):
            skip_count += 1
        else:
            filtered_pairs.append((inp, out))

    print(f"Total: {len(path_pairs)}, Skip (already exists): {skip_count}, To process: {len(filtered_pairs)}")

    if len(filtered_pairs) == 0:
        print("Nothing to process.")
        return

    # Save the list of generated mask paths for Step 1
    mask_paths_file = os.path.join(args.output_dir, "generated_mask_paths.json")
    all_output_paths = [out for _, out in path_pairs]
    with open(mask_paths_file, "w") as f:
        json.dump(all_output_paths, f, indent=2)
    print(f"Mask path list saved to: {mask_paths_file}")

    with ProcessPoolExecutor(max_workers=args.workers) as executor:
        list(tqdm(
            executor.map(generate_mask_from_path, filtered_pairs),
            total=len(filtered_pairs),
            desc="Generating masks",
        ))

    print("Done!")


if __name__ == "__main__":
    main()
