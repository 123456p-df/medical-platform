# Data Processing

This directory contains scripts for preprocessing 3D medical volumes (CT/MRI in NIfTI format) before training RadSight.

## Pipeline Overview

The preprocessing pipeline consists of three steps:

```
Raw NIfTI CT volumes
    │
    ▼
Step 0 (optional): Generate segmentation masks via TotalSegmentator
    │
    ▼
Step 1: Resample to reference spacing (1.0, 1.0, 5.0) mm
    │
    ▼
Step 2: Crop non-zero region → Pad to (96, 256, 384)
    │
    ▼
Processed volumes ready for training
```

## Step 0: Generate Segmentation Masks (Optional)

If your CT volumes do not have pre-existing segmentation masks, use [TotalSegmentator](https://github.com/wasserth/TotalSegmentator) to generate them automatically.

```bash
pip install TotalSegmentator
```

**Option A:** From a directory of NIfTI files:

```bash
python data_process/0_generate_mask.py \
    --input_dir path/to/ct_volumes \
    --output_dir path/to/output_masks \
    --workers 4
```

**Option B:** From a metadata CSV file:

```bash
python data_process/0_generate_mask.py \
    --metadata_csv path/to/metadata.csv \
    --data_root path/to/data_root \
    --output_dir path/to/output_masks \
    --split train \
    --workers 4
```

This script outputs a `generated_mask_paths.json` file in the output directory, which can be directly used as `--mask_json` in Step 1.

## Step 1: Resample to Reference Spacing

Resamples CT images (trilinear) and segmentation masks (nearest-neighbor) to a unified reference spacing.

```bash
python data_process/1_resize.py \
    --image_json path/to/image_paths.json \
    --mask_json path/to/mask_paths.json \
    --output_dir path/to/output \
    --workers 16
```

**Input JSON format** — a list of file paths:
```json
[
    "/data/patient_001/ct.nii.gz",
    "/data/patient_002/ct.nii.gz"
]
```

## Step 2: Crop and Pad

Crops the non-zero region (with safety margin), normalizes HU values, and pads to the target size `(96, 256, 384)`.

```bash
python data_process/2_crop_pad.py \
    --image_json path/to/resized_image_paths.json \
    --output_dir path/to/output \
    --target_size 96 256 384 \
    --hu_min -1000 --hu_max 1000 \
    --workers 64
```

## Output Structure

```
output_dir/
├── resized_images/          # Step 1 output
│   ├── patient_001/
│   │   └── ct.nii.gz
│   └── ...
├── resized_masks/           # Step 1 output
│   ├── patient_001/
│   │   └── merged_mask.nii.gz
│   └── ...
├── processed_images/        # Step 2 output (ready for training)
│   ├── patient_001/
│   │   └── ct.nii.gz
│   └── ...
└── processed_masks/         # Step 2 output
    ├── patient_001/
    │   └── merged_mask.nii.gz
    └── ...
```
