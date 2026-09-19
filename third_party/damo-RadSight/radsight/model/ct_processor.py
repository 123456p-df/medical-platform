# radsight/processsors/ct_processor.py
import numpy as np
import torch
from transformers.image_processing_utils import BaseImageProcessor, BatchFeature
from transformers.utils import TensorType
from typing import Optional, Union, List, Dict, Any
import warnings
from monai import transforms
try:
    from transformers.utils import requires_backends
except ImportError:
    # 如果导入失败，创建一个简单的替代函数
    def requires_backends(obj, backends):
        return obj

class CTImageProcessor(BaseImageProcessor):
    r"""
    3D CT Image Processor that outputs format compatible with Qwen2VLImageProcessor.
    
    Outputs:
        - pixel_values: flattened 3D patches of shape (N_total_patches, feature_dim)
        - image_grid_thw: grid size per image of shape (num_images, 3), where T=D//pd
    """
    model_input_names = ["pixel_values"]

    def __init__(
        self,
        image_size=(96, 256, 384),
        patch_size=(4, 16, 16),  # (pd, ph, pw)
        mean=None,
        std=None,
        min_scale=0.5,
        max_scale=1.0,
        is_train=True,
        **kwargs,
    ) -> None:
        super().__init__(**kwargs)

        self.image_size = image_size
        self.is_train = is_train
        self.ndim = 3
        if mean is None:
            self.mean = (0.48145466, 0.4578275, 0.40821073)
        if std is None:
            self.std = (0.26862954, 0.26130258, 0.27577711)
    
    def _get_train_transform(self):
        return transforms.Compose([
            transforms.RandFlip(prob=0.2, spatial_axis=0),
            transforms.RandFlip(prob=0.2, spatial_axis=1),
            transforms.RandFlip(prob=0.2, spatial_axis=2),
        ])
                
    def _get_padder(self):
            return transforms.SpatialPadd(
                keys=["image"], 
                spatial_size=self.image_size, 
                mode='constant', 
                constant_values=0,
                method="end"
            )
            
    def _get_centercrop(self):
        return transforms.CenterSpatialCropd(
                keys=["image"],
                roi_size=self.image_size
            )
        
    def _get_resize(self):
        return transforms.Resized(
                keys=["image"],
                spatial_size=self.image_size,  # (96, 256, 384)
                mode="trilinear",
                align_corners=False)
        
    def transform_orign(self, image_zip):
        padder = self._get_padder()
        crop = self._get_centercrop()
        resize = self._get_resize()
        image = image_zip # (C, D, H, W)
        
        if image.ndim == 5:
            image = image[..., 0]  # → (C, D, H, W)

        data = {}
        data["image"] = image
        data_pad = padder(data)
        data_crop = crop(data_pad)
        data_resize = resize(data_crop)
        return {
            'image': data_resize['image'],
        }

    def make_flat_list_of_images(
        self,
        images
    ):
        if self.is_train:
            if isinstance(images, dict):
                if images['image'].ndim == self.ndim:
                    return [images]
                else:
                    return images
            else:
                raise NotImplementedError("not implement for this ")
        else:
            if isinstance(images, dict):
                if images['image'].ndim == self.ndim + 1:
                    return [images]
                else:
                    return images
            else:
                raise NotImplementedError("not implement for this ")
            

    def preprocess(
        self,
        images,
        return_tensors="pt",
        **kwargs
    ) -> BatchFeature:
        """
        Preprocess CT images to match Qwen2VL output format.

        Args:
            images: dict or list of dicts with keys ["image", "image_meta_dict"]
            return_tensors: "pt" for PyTorch tensors

        Returns:
            BatchFeature with:
                - pixel_values: (total_N_patches, feature_dim)
                - image_grid_thw: (num_images, 3)
        """
        # images = self.make_flat_list_of_images(images)

        all_patches = []
        all_grid_thw = []
        for item in images:
            try:
                vol_dict = self.transform_orign(item)  # -> (C, D, H, W)

                if self.is_train:
                    vol = vol_dict["image"]
                grid_thw = torch.tensor([12, 8, 12], dtype=torch.long) # Based on the last layer of the visual encoder 1152 tokens
                all_patches.append(vol)
                all_grid_thw.append(grid_thw)
            except Exception as e:
                print(f"Error processing CT image: {e}")
                continue

        # Concatenate all
        pixel_values = np.stack(all_patches, axis=0)  # (total_N, feature_dim)
        image_grid_thw = np.stack(all_grid_thw, axis=0)  # (total_N, feature_dim)

        data = {
            "pixel_values": pixel_values,
            "grid_sizes": image_grid_thw,
            "merge_sizes": np.array([1] * len(all_grid_thw))
        }

        return BatchFeature(data=data, tensor_type=return_tensors)

    def __call__(self, images, return_tensors="pt", **kwargs):
        return self.preprocess(images=images, return_tensors=return_tensors, **kwargs)
    
    def to_dict(self):
        encoder_dict = super().to_dict()
        encoder_dict.pop("train_transform", None)
        encoder_dict.pop("eval_transform", None)
        encoder_dict.pop("pad_func", None)
        encoder_dict.pop("Compose", None)
        encoder_dict.pop("Resized", None)
        return encoder_dict

