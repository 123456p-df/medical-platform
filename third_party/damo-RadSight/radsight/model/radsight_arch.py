# Adopted from https://github.com/haotian-liu/LLaVA. Below is the original copyright:
#    Copyright 2023 Haotian Liu
#
#    Licensed under the Apache License, Version 2.0 (the "License");
#    you may not use this file except in compliance with the License.
#    You may obtain a copy of the License at
#
#        http://www.apache.org/licenses/LICENSE-2.0
#
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS,
#    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#    See the License for the specific language governing permissions and
#    limitations under the License.

import os
import math
from abc import ABC, abstractmethod
from typing import List, Optional, Tuple, Union

import einops
import torch
import torch.distributed as dist
import torch.nn as nn

from ..constants import IGNORE_INDEX, MODAL_INDEX_MAP, NUM_FRAMES
from .encoder import build_vision_encoder
from .projector import build_vision_projector, load_mm_projector, build_vision_projector_3d
from .builder import build_vision_tower


class RadSightMetaModel:

    def __init__(self, config):
        super(RadSightMetaModel, self).__init__(config)

        # 2D vision encoder
        if hasattr(config, "vision_encoder") or hasattr(config, "mm_vision_encoder"):
            self.vision_encoder = build_vision_encoder(config, delay_load=False)
            self.mm_projector = build_vision_projector(config, self.vision_encoder.hidden_size)
            
        # 3D vision encoder
        if hasattr(config, "ct_vision_encoder"):
            self.vision_encoder_3d = build_vision_tower(config)
            self.mm_projector_3d = build_vision_projector_3d(config, 256)

    def get_vision_encoder(self, modal='image'):
        if modal == 'volume':
            vision_encoder = getattr(self, 'vision_encoder_3d', None)
        else:
            vision_encoder = getattr(self, 'vision_encoder', None)
        if type(vision_encoder) is list:
            vision_encoder = vision_encoder[0]
        return vision_encoder

    def get_mm_projector(self, modal='image'):
        if modal == 'volume':
            return self.mm_projector_3d
        else:
            return self.mm_projector

    def initialize_vision_modules(self, model_args, fsdp=None):
        vision_encoder = model_args.vision_encoder
        mm_vision_select_layer = model_args.mm_vision_select_layer
        mm_vision_select_feature = model_args.mm_vision_select_feature
        pretrain_mm_projector = model_args.pretrain_mm_projector
        pretrain_mm_projector_3d = model_args.pretrain_mm_projector_3d
        
        # 3D vision encoder parameters - radar
        # model_args.image_channel = 1
        # model_args.image_size = (96, 256, 384)
        # model_args.patch_size = (16, 32, 32)

        # 2D
        if self.get_vision_encoder("image") is None:
            vision_encoder = build_vision_encoder(model_args)

            if fsdp is not None and len(fsdp) > 0:
                self.vision_encoder = [vision_encoder]
            else:
                self.vision_encoder = vision_encoder
        else:
            if fsdp is not None and len(fsdp) > 0:
                vision_encoder = self.vision_encoder[0]
            else:
                vision_encoder = self.vision_encoder
            # NOTE: only compatible with delay_load encoder
            # vision_encoder.load_model(vision_encoder.cfg_only)
        
        # 3D 
        if self.get_vision_encoder("volume") is None:
            vision_encoder_3d = build_vision_tower(model_args)
    
            if fsdp is not None and len(fsdp) > 0:
                self.vision_encoder_3d = [vision_encoder_3d]
            else:
                self.vision_encoder_3d = vision_encoder_3d
        else:
            if fsdp is not None and len(fsdp) > 0:
                vision_encoder_3d = self.vision_encoder_3d[0]
            else:
                vision_encoder_3d = self.vision_encoder_3d
        
        # load 3d ckpt
        loaded_count = 0
        skipped_keys = []  
        if model_args.pretrain_vision_model is not None:
            vision_model_weights = torch.load(model_args.pretrain_vision_model, map_location='cpu')
            model_state_dict = self.vision_encoder_3d.vision_tower.state_dict()
            for key, value in vision_model_weights['model'].items():
                mapped_key = key
                if mapped_key.startswith("visual_encoder."):
                    mapped_key = mapped_key[len("visual_encoder."):]
                mapped_key = mapped_key.replace("UNet.", "unet_encoder.")

                if mapped_key in model_state_dict:
                    if model_state_dict[mapped_key].shape == value.shape:
                        model_state_dict[mapped_key] = value
                        loaded_count += 1
                    else:
                        skipped_keys.append(f"{mapped_key}: model={model_state_dict[mapped_key].shape} vs ckpt={value.shape}")
                else:
                    skipped_keys.append(f"{mapped_key}: not in model")

            self.vision_encoder_3d.vision_tower.load_state_dict(model_state_dict, strict=True)
            # print(f"[3D Encoder] Loaded {loaded_count}/{len(model_state_dict)} keys from radar checkpoint")
            
        # load 2d ckpt
        if model_args.pretrain_vision_model_2d is not None:
            from safetensors.torch import load_file
            state_dict = load_file(
                os.path.join(model_args.pretrain_vision_model_2d, "model.safetensors")
            )
            
            self.vision_encoder.vision_encoder.load_state_dict(state_dict, strict=True)

        self.config.use_mm_proj = True
        self.config.mm_projector_type = getattr(model_args, 'mm_projector_type', 'linear')
        self.config.mm_projector_type_3d = getattr(model_args, 'mm_projector_type_3d', 'linear')
        self.config.mm_hidden_size = vision_encoder.hidden_size
        self.config.mm_vision_select_layer = mm_vision_select_layer
        self.config.mm_vision_select_feature = mm_vision_select_feature
        self.config.mm_hidden_size = vision_encoder.hidden_size
        self.config.mm_hidden_size_3d = 256
        
        # 3D projector
        if getattr(self, 'mm_projector_3d', None) is None:
            self.mm_projector_3d = build_vision_projector_3d(self.config, 256)
        else:
            # In case it is frozen by LoRA 
            for p in self.mm_projector_3d.parameters():
                p.requires_grad = True

        if pretrain_mm_projector_3d is not None:
            if os.path.exists(pretrain_mm_projector_3d):
                is_local = True
                if os.path.isdir(pretrain_mm_projector_3d):
                    mm_projector_weights = load_mm_projector(pretrain_mm_projector_3d)
                else:
                    mm_projector_weights = torch.load(pretrain_mm_projector_3d, map_location='cpu')
            else:
                # Support loading projector weights from remote HuggingFace model hub
                is_local = False
                pretrain_mm_projector_3d = pretrain_mm_projector_3d.replace('mm_projector.bin', '')
                pretrain_mm_projector_3d = pretrain_mm_projector_3d.strip('/').strip('\\').strip()
                mm_projector_weights_3d = load_mm_projector(pretrain_mm_projector_3d)

            def get_w(weights, keyword):
                return {k.split(keyword + '.')[1]: v for k, v in weights.items() if keyword in k}

            # self.mm_projector.load_state_dict(get_w(mm_projector_weights, 'mm_projector'))
            # set strict=False to avoid missing key error regarding bert.embeddings.position_ids
            self.mm_projector_3d.load_state_dict(get_w(mm_projector_weights_3d, 'mm_projector'), strict=False)
        
        # 2D projector
        if getattr(self, 'mm_projector', None) is None:
            self.mm_projector = build_vision_projector(self.config, vision_encoder.hidden_size)
        else:
            # In case it is frozen by LoRA
            for p in self.mm_projector.parameters():
                p.requires_grad = True

        if pretrain_mm_projector is not None:
            if os.path.exists(pretrain_mm_projector):
                is_local = True
                if os.path.isdir(pretrain_mm_projector):
                    mm_projector_weights = load_mm_projector(pretrain_mm_projector)
                else:
                    mm_projector_weights = torch.load(pretrain_mm_projector, map_location='cpu')
            else:
                # Support loading projector weights from remote HuggingFace model hub
                is_local = False
                pretrain_mm_projector = pretrain_mm_projector.replace('mm_projector.bin', '')
                pretrain_mm_projector = pretrain_mm_projector.strip('/').strip('\\').strip()
                mm_projector_weights = load_mm_projector(pretrain_mm_projector)

            def get_w(weights, keyword):
                return {k.split(keyword + '.')[1]: v for k, v in weights.items() if keyword in k}

            # self.mm_projector.load_state_dict(get_w(mm_projector_weights, 'mm_projector'))
            # set strict=False to avoid missing key error regarding bert.embeddings.position_ids
            self.mm_projector.load_state_dict(get_w(mm_projector_weights, 'mm_projector'), strict=False)


class RadSightMetaForCausalLM(ABC):

    @abstractmethod
    def get_model(self):
        pass

    def get_vision_encoder(self, modal):
        if isinstance(modal, list):
            modal = modal[0]
        return self.get_model().get_vision_encoder(modal)

    def get_mm_projector(self, modal):
        if isinstance(modal, list):
            modal = modal[0]
        return self.get_model().get_mm_projector(modal)

    def encode_images(
        self,
        pixel_values: torch.FloatTensor,
        grid_sizes: torch.LongTensor,
        merge_sizes: torch.LongTensor,
        modals: str
    ) -> torch.FloatTensor:
        if modals == 'volume':
            mm_features = self.get_model().get_vision_encoder(modals)(
                pixel_values=pixel_values,
                # grid_sizes=grid_sizes,
                # merge_sizes=merge_sizes,
                # modals=modals
            )
            mm_features = self.get_model().mm_projector_3d(mm_features)
        else:
            mm_features = self.get_model().get_vision_encoder(modals)(
                pixel_values=pixel_values,
                grid_sizes=grid_sizes,
                merge_sizes=merge_sizes,
                modals=modals
            )
            mm_features = self.get_model().mm_projector(mm_features)
        return mm_features

    def _get_valid_visual_tokens(
        self,
        mm_features: torch.FloatTensor,
        batched_num_patches: torch.LongTensor,
        modals: List[str],
    ):
        valid_masks = []
        for num_patches, modal in zip(batched_num_patches, modals):
            valid_mask = torch.full((num_patches, ), modal != "text", dtype=torch.bool, device=mm_features.device)
            valid_masks.append(valid_mask)
        mm_features = mm_features[torch.cat(valid_masks)]
        return mm_features

    def _maybe_truncate_visual_tokens(
        self,
        mm_features: torch.FloatTensor,
        compression_mask: torch.BoolTensor,
        batched_num_patches: torch.LongTensor,
        modals: List[str],
        input_ids: torch.LongTensor,
        position_ids: Optional[torch.LongTensor] = None,
    ):
        if position_ids is None or mm_features.shape[0] == input_ids.eq(self.config.image_token_index).sum():
            return mm_features, compression_mask

        truncation_mask = []
        for num_patches, modal in zip(batched_num_patches, modals):
            if modal == "text":
                truncation_mask.append(torch.ones((0,), dtype=torch.bool, device=input_ids.device))
            else:
                truncation_mask.append(torch.ones((num_patches,), dtype=torch.bool, device=input_ids.device))

        seq_end_indices = torch.nonzero(position_ids == 0)[:, 0]
        seq_end_indices = seq_end_indices[seq_end_indices > 0].tolist()+ [len(input_ids)]
        seq_start_indices = [0] + seq_end_indices[:-1]
        num_visual_tokens = [
            input_ids[start:end].eq(self.config.image_token_index).sum()
            for start, end in zip(seq_start_indices, seq_end_indices)
        ]

        for n, mask in zip(num_visual_tokens, truncation_mask):
            if len(mask) > 0:
                mask[n:] = False
        truncation_mask = torch.cat(truncation_mask)

        return mm_features[truncation_mask], compression_mask[truncation_mask]

    def _get_compression_mask(
        self,
        pixel_values: torch.FloatTensor,
        batched_num_patches: torch.LongTensor,
        grid_sizes: torch.LongTensor,
        merge_sizes: torch.LongTensor,
        modals: List[str],
        threshold: float = 0.1,
        min_tokens: int = 1,
    ) -> torch.BoolTensor:
        batched_images = pixel_values.split(grid_sizes.prod(dim=1).tolist(), dim=0)
        compression_masks = []

        for images, num_patches, grid_size, merge_size, modal in zip(
            batched_images, batched_num_patches, grid_sizes, merge_sizes, modals
        ):
            t, h, w = grid_size
            if modal == "image" or (modal == "video" and t == 1):
                compression_masks.append(torch.ones((num_patches,), dtype=torch.bool, device=images.device))

            elif modal == "video":
                # NOTE: video token compressor
                images = images.view(t, (h // merge_size) * (w // merge_size), -1)

                pixel_diff = images[1:] - images[:-1]
                pixel_diff = torch.abs(pixel_diff).mean(dim=-1) * 255
                pixel_diff = torch.cat([torch.full_like(pixel_diff[0:1], threshold + 1), pixel_diff], dim=0)
                mask = pixel_diff > threshold
                padding_ids = torch.nonzero(mask.sum(dim=1) < min_tokens)[:, 0]
                # mask[padding_ids, torch.randperm(min_tokens)] = 1
                mask[padding_ids, :min_tokens] = 1
                compression_masks.append(mask.flatten())

            else:
                # in case of psuedo image
                compression_masks.append(torch.ones((0,), dtype=torch.bool, device=images.device))

        return torch.cat(compression_masks)

    def _compress_visual_tokens(
        self,
        compression_mask: torch.BoolTensor,
        mm_features: torch.FloatTensor,
        input_ids: torch.LongTensor,
        attention_mask: Optional[torch.Tensor] = None,
        position_ids: Optional[torch.LongTensor] = None,
        labels: Optional[torch.LongTensor] = None,
    ):
        mm_features = mm_features[compression_mask]
        image_selected = (input_ids == self.config.image_token_index)

        text_masks = torch.logical_not(image_selected)
        text_masks[image_selected] = compression_mask
        input_ids = input_ids[text_masks]

        if attention_mask is not None:
            attention_mask = attention_mask[text_masks]
        if labels is not None:
            labels = labels[text_masks]
        if position_ids is not None:
            # FIXME: assume the first position_id is always 0
            position_ids = position_ids[text_masks]
            pos_start = [0] + torch.nonzero(position_ids == 0)[:, 0].tolist()
            pos_end = pos_start[1:] + [len(input_ids)]
            position_ids = torch.cat([torch.arange(end - start, device=input_ids.device) for start, end in zip(pos_start, pos_end)])

        return mm_features, input_ids, attention_mask, position_ids, labels

    def prepare_inputs_labels_for_multimodal(
        self,
        input_ids: torch.LongTensor = None,
        attention_mask: Optional[torch.Tensor] = None,
        position_ids: Optional[torch.LongTensor] = None,
        past_key_values: Optional[List[torch.FloatTensor]] = None,
        labels: Optional[torch.LongTensor] = None,
        pixel_values: Optional[torch.FloatTensor] = None,
        grid_sizes: Optional[torch.LongTensor] = None,
        merge_sizes: Optional[torch.LongTensor] = None,
        modals: Optional[List[str]] = None,
    ):
        vision_encoder = self.get_vision_encoder(modals)
        # NOTE: text-only situation
        if vision_encoder is None or pixel_values is None or input_ids.shape[1] == 1:
            return input_ids, attention_mask, position_ids, past_key_values, None, labels

        # 1. flatten text inputs
        B, N = input_ids.shape
        input_ids = input_ids.view(B * N)
        if attention_mask is not None:
            attention_mask = attention_mask.view(B * N)
        if position_ids is not None:
            position_ids = position_ids.view(B * N)
        if labels is not None:
            labels = labels.view(B * N)

        # 2. embed visual tokens
        batched_num_patches = grid_sizes.prod(dim=1).div(merge_sizes ** 2).long()
        mm_features = self.encode_images(pixel_values, grid_sizes, merge_sizes, modals[0]).to(input_ids.device)
        if modals[0] == 'volume':
            # 如果是CT、MR的话转为序列
            mm_features = mm_features.flatten(0, 1)
        mm_features = self._get_valid_visual_tokens(mm_features, batched_num_patches, modals)

        if modals[0] == 'volume':
            # 上一步已经做了mask的压缩，因此这里不做了
            compression_mask = self._get_compression_mask(
            mm_features, batched_num_patches, grid_sizes, merge_sizes, modals
            )
        else:
            compression_mask = self._get_compression_mask(
                pixel_values, batched_num_patches, grid_sizes, merge_sizes, modals
            )
        mm_features, compression_mask = self._maybe_truncate_visual_tokens(
            mm_features, compression_mask, batched_num_patches, modals, input_ids, position_ids
        )

        # 3. compress visual tokens
        if self.config.use_token_compression:
            assert B == 1, "Token compression is only supported for batch_size=1"
            mm_features, input_ids, attention_mask, position_ids, labels = self._compress_visual_tokens(
                compression_mask, mm_features, input_ids, attention_mask, position_ids, labels
            )

        # 4. embed text tokens
        inputs_embeds = self.get_model().language_model.embed_tokens(input_ids).clone()

        # 5. replace multimodal tokens with features
        image_selected = (input_ids == self.config.image_token_index)
        inputs_embeds[image_selected] = inputs_embeds[image_selected] * 0.0 + mm_features   

        # 6. reshape back to batched format
        C = inputs_embeds.shape[-1]
        inputs_embeds = inputs_embeds.reshape(B, -1, C)
        if attention_mask is not None:
            attention_mask = attention_mask.view(B, -1)
        if labels is not None:
            labels = labels.view(B, -1)
        if position_ids is not None:
            position_ids = position_ids.view(B, -1)

        return None, attention_mask, position_ids, past_key_values, inputs_embeds, labels
