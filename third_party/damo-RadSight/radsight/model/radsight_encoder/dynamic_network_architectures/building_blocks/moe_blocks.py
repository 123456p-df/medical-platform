from typing import Tuple, List, Union, Type

import numpy as np
import torch.nn
from torch import nn
from torch.nn.modules.conv import _ConvNd
from torch.nn.modules.dropout import _DropoutNd
import torch.nn.functional as F


from dynamic_network_architectures.building_blocks.helper import maybe_convert_scalar_to_list
from dynamic_network_architectures.building_blocks.residual import StackedResidualBlocks, BottleneckD, BasicBlockD
from dynamic_network_architectures.building_blocks.simple_conv_blocks import ConvDropoutNormReLU


moe_config_5x2experts = {
    "conv": {

    },
    "residual": {
        "n_stages": 7,
        "features_per_stage": [32, 64, 128, 256, 320, 320, 320],
        "conv_op": "torch.nn.modules.conv.Conv3d",
        "kernel_sizes": [[1, 3, 3], [1, 3, 3], [3, 3, 3], [3, 3, 3], [3, 3, 3], [3, 3, 3], [3, 3, 3]],
        "strides": [ [ 1, 1, 1 ], [ 1, 2, 2 ], [ 1, 2, 2 ], [ 2, 2, 2 ], [ 2, 2, 2 ], [ 1, 2, 2 ], [ 1, 2, 2 ]],
        "n_blocks_per_stage": [ 1, 3, 4, 6, 6, 6, 6 ],
        "conv_bias": true,
        "norm_op": "torch.nn.modules.instancenorm.InstanceNorm3d",
        "norm_op_kwargs": {"eps": 1e-05, "affine": true},
        "dropout_op": null,
        "dropout_op_kwargs": null,
        "nonlin": "torch.nn.LeakyReLU",
        "nonlin_kwargs": {"inplace": true}
     },

    }


MOE_dict = {
  "moe_config_5x2experts": moe_config_5x2experts,
}


class StackedConvBlocksMoE(nn.Module):
    def __init__(self,
                 stage_id: int,
                 num_convs: int,
                 conv_op: Type[_ConvNd],
                 input_channels: int,
                 output_channels: Union[int, List[int], Tuple[int, ...]],
                 kernel_size: Union[int, List[int], Tuple[int, ...]],
                 initial_stride: Union[int, List[int], Tuple[int, ...]],
                 conv_bias: bool = False,
                 norm_op: Union[None, Type[nn.Module]] = None,
                 norm_op_kwargs: dict = None,
                 dropout_op: Union[None, Type[_DropoutNd]] = None,
                 dropout_op_kwargs: dict = None,
                 nonlin: Union[None, Type[torch.nn.Module]] = None,
                 nonlin_kwargs: dict = None,
                 nonlin_first: bool = False,
                 num_experts_per_type: int = 2,
                 expert_types: list = ["conv", "residual", "resNeXt", "Transformer", "Mamba"],
                 top_k_experts: int = 4,
                 norm_topk_prob: bool= False,
                 moe_config: str="moe_config_5x2experts",
                 ):
        """

        :param conv_op:
        :param num_convs:
        :param input_channels:
        :param output_channels: can be int or a list/tuple of int. If list/tuple are provided, each entry is for
        one conv. The length of the list/tuple must then naturally be num_convs
        :param kernel_size:
        :param initial_stride:
        :param conv_bias:
        :param norm_op:
        :param norm_op_kwargs:
        :param dropout_op:
        :param dropout_op_kwargs:
        :param nonlin:
        :param nonlin_kwargs:
        """
        super().__init__()

        self.num_expert_types = len(expert_types)
        self.num_experts_per_type = num_experts_per_type
        self.top_k = top_k_experts
        self.norm_topk_prob = norm_topk_prob
        self.expert_num = self.num_expert_types * self.num_experts_per_type
        self.config = MOE_dict[moe_config]

        if not isinstance(output_channels, (tuple, list)):
            output_channels = [output_channels] * num_convs


        self.gate = nn.Sequential(
            nn.AdaptiveMaxPool3d((1, 1, 1)),
            nn.Linear(input_channels, self.expert_num, bias=False),
        )

        self.shared_expert = nn.Sequential(
            ConvDropoutNormReLU(
                conv_op, input_channels, output_channels[0], kernel_size, initial_stride, conv_bias, norm_op,
                norm_op_kwargs, dropout_op, dropout_op_kwargs, nonlin, nonlin_kwargs, nonlin_first
            ),
            *[
                ConvDropoutNormReLU(
                    conv_op, output_channels[i - 1], output_channels[i], kernel_size, 1, conv_bias, norm_op,
                    norm_op_kwargs, dropout_op, dropout_op_kwargs, nonlin, nonlin_kwargs, nonlin_first
                )
                for i in range(1, num_convs)
            ]
        )

        experts = []
        for tp in expert_types:
            for i in range(num_experts_per_type):
                if tp == "conv":
                    experts.append(
                        nn.Sequential(
                            ConvDropoutNormReLU(
                            conv_op, input_channels, output_channels[0], kernel_size, initial_stride, conv_bias, norm_op,
                            norm_op_kwargs, dropout_op, dropout_op_kwargs, nonlin, nonlin_kwargs, nonlin_first),
                            *[
                            ConvDropoutNormReLU(
                            conv_op, output_channels[i - 1], output_channels[i], kernel_size, 1, conv_bias, norm_op,
                            norm_op_kwargs, dropout_op, dropout_op_kwargs, nonlin, nonlin_kwargs, nonlin_first) for i in range(1, num_convs)]
                            ))
                elif tp == "residual":
                    conv_op = self.config[tp]["conv_op"]
                    kernel_size = self.config[tp]["kernel_sizes"][stage_id]
                    initial_stride = self.config[tp]["strides"][stage_id]
                    conv_bias = self.config[tp]["conv_bias"]
                    norm_op = self.config[tp]["norm_op"]
                    norm_op_kwargs = self.config[tp]["norm_op_kwargs"]
                    dropout_op = self.config[tp]["dropout_op"]
                    dropout_op_kwargs = self.config[tp]["dropout_op_kwargs"]
                    nonlin = self.config[tp]["nonlin"]
                    nonlin_kwargs = self.config[tp]["nonlin_kwargs"]
                    stochastic_depth_p = 0.0,
                    squeeze_excitation = False,
                    squeeze_excitation_reduction_ratio = 1. / 16
                    n_blocks = self.config[tp]["n_blocks_per_stage"][stage_id]

                    experts.append(
                        nn.Sequential(
                            BasicBlockD(conv_op, input_channels, output_channels[0], kernel_size, initial_stride, conv_bias,
                            norm_op, norm_op_kwargs, dropout_op, dropout_op_kwargs, nonlin, nonlin_kwargs, stochastic_depth_p,
                            squeeze_excitation, squeeze_excitation_reduction_ratio),
                            *[BasicBlockD(conv_op, output_channels[n - 1], output_channels[n], kernel_size, 1, conv_bias, norm_op,
                                    norm_op_kwargs, dropout_op, dropout_op_kwargs, nonlin, nonlin_kwargs, stochastic_depth_p,
                                    squeeze_excitation, squeeze_excitation_reduction_ratio) for n in range(1, n_blocks)]
                        )
                    )
                else:
                    assert False

        self.expert = nn.ModuleList(experts)

        self.output_channels = output_channels[-1]
        self.initial_stride = maybe_convert_scalar_to_list(conv_op, initial_stride)

    def forward(self, x):
        # b,c,d,h,w
        b,c,d,h,w = x.shape

        #router_logits
        router_logits = self.gate(x).reshape(b, -1) #b,expert_num

        #top k experts
        routing_weights = F.softmax(router_logits, dim=1)
        routing_weights, selected_experts = torch.topk(routing_weights, self.top_k, dim=-1)

        if self.norm_topk_prob:
            routing_weights /= routing_weights.sum(dim=-1, keepdim=True)

        routing_weights = routing_weights.to(x.dtype)

        expert_mask = torch.nn.functional.one_hot(selected_experts, num_classes=self.expert_num).permute(2, 1, 0) #expert_num, topk, batch

        #expert
        for expert_idx in range(self.expert_num):
            expert_layer = self.experts[expert_idx]
            








        return self.convs(x)

    def compute_conv_feature_map_size(self, input_size):
        assert len(input_size) == len(self.initial_stride), "just give the image size without color/feature channels or " \
                                                            "batch channel. Do not give input_size=(b, c, x, y(, z)). " \
                                                            "Give input_size=(x, y(, z))!"
        output = self.convs[0].compute_conv_feature_map_size(input_size)
        size_after_stride = [i // j for i, j in zip(input_size, self.initial_stride)]
        for b in self.convs[1:]:
            output += b.compute_conv_feature_map_size(size_after_stride)
        return output