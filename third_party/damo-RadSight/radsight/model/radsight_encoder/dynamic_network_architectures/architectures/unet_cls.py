from typing import Union, Type, List, Tuple

import torch
from dynamic_network_architectures.building_blocks.helper import convert_conv_op_to_dim
from dynamic_network_architectures.building_blocks.plain_conv_encoder import PlainConvEncoder
from dynamic_network_architectures.building_blocks.residual import BasicBlockD, BottleneckD
from dynamic_network_architectures.building_blocks.residual_encoders import ResidualEncoder
from dynamic_network_architectures.building_blocks.unet_decoder_cls import UNetDecoder
from dynamic_network_architectures.building_blocks.unet_residual_decoder import UNetResDecoder
from dynamic_network_architectures.initialization.weight_init import InitWeights_He
from dynamic_network_architectures.initialization.weight_init import init_last_bn_before_add_to_0
from torch import nn
from torch.nn.modules.conv import _ConvNd
from torch.nn.modules.dropout import _DropoutNd
import torch.nn.functional as F


class PlainConvUNetCls(nn.Module):
    def __init__(self,
                 input_channels: int,
                 n_stages: int,
                 features_per_stage: Union[int, List[int], Tuple[int, ...]],
                 conv_op: Type[_ConvNd],
                 kernel_sizes: Union[int, List[int], Tuple[int, ...]],
                 strides: Union[int, List[int], Tuple[int, ...]],
                 n_conv_per_stage: Union[int, List[int], Tuple[int, ...]],
                 num_classes: int,
                 n_conv_per_stage_decoder: Union[int, Tuple[int, ...], List[int]],
                 conv_bias: bool = False,
                 norm_op: Union[None, Type[nn.Module]] = None,
                 norm_op_kwargs: dict = None,
                 dropout_op: Union[None, Type[_DropoutNd]] = None,
                 dropout_op_kwargs: dict = None,
                 nonlin: Union[None, Type[torch.nn.Module]] = None,
                 nonlin_kwargs: dict = None,
                 deep_supervision: bool = False,
                 nonlin_first: bool = False,
                 num_cls_classes: int = None,
                 norm_dim = 32
                 ):
        """
        nonlin_first: if True you get conv -> nonlin -> norm. Else it's conv -> norm -> nonlin
        """
        super().__init__()
        if isinstance(n_conv_per_stage, int):
            n_conv_per_stage = [n_conv_per_stage] * n_stages
        if isinstance(n_conv_per_stage_decoder, int):
            n_conv_per_stage_decoder = [n_conv_per_stage_decoder] * (n_stages - 1)
        assert len(n_conv_per_stage) == n_stages, "n_conv_per_stage must have as many entries as we have " \
                                                  f"resolution stages. here: {n_stages}. " \
                                                  f"n_conv_per_stage: {n_conv_per_stage}"
        assert len(n_conv_per_stage_decoder) == (n_stages - 1), "n_conv_per_stage_decoder must have one less entries " \
                                                                f"as we have resolution stages. here: {n_stages} " \
                                                                f"stages, so it should have {n_stages - 1} entries. " \
                                                                f"n_conv_per_stage_decoder: {n_conv_per_stage_decoder}"
        self.encoder = PlainConvEncoder(input_channels, n_stages, features_per_stage, conv_op, kernel_sizes, strides,
                                        n_conv_per_stage, conv_bias, norm_op, norm_op_kwargs, dropout_op,
                                        dropout_op_kwargs, nonlin, nonlin_kwargs, return_skips=True,
                                        nonlin_first=nonlin_first)
        self.decoder = UNetDecoder(self.encoder, num_classes, n_conv_per_stage_decoder, deep_supervision,
                                   nonlin_first=nonlin_first)


        #class cls
        self.num_cls_classes = num_cls_classes
        self.unet_fixed = False
        self.norm_dim = norm_dim
        self.projections = nn.ModuleList()
        for i in range(n_stages):
            #for example: 5,4,3,2,1
            self.projections.append(
                nn.Sequential(
                    nn.Conv3d(features_per_stage[i], self.norm_dim, kernel_size=1), 
                    nn.InstanceNorm3d(self.norm_dim, affine=True), 
                    nn.ReLU(inplace=True))
            )
        out_dim = self.norm_dim * n_stages
        self.cls_conv = nn.Sequential(
            nn.Conv3d(out_dim, out_dim, kernel_size=1),
            nn.InstanceNorm3d(out_dim, affine=True), 
            nn.ReLU(inplace=True))
        self.classifier = nn.Linear(out_dim, self.num_cls_classes)

    def forward(self, x, sliding_window=True):

        ##################### debug
        for name,params in self.encoder.named_parameters():
            if params.requires_grad:
                break
        for name,params in self.decoder.named_parameters():
            if params.requires_grad:
                break
        #####################
        skips = self.encoder(x)

        # add cls
        seg_outputs = self.decoder(skips)

        fts = self.decoder.get_fts()
        # print(len(skips), len(seg_outputs), len(fts))
        # for i in range(len(skips)):
        #     print(i)
        #     print(skips[i].shape)
        #     print(seg_outputs[i].shape)
        #     print(fts[i].shape)
        #     print()
        # assert False
        '''
        7 6 6
        0
        torch.Size([2, 32, 28, 256, 256])
        torch.Size([2, 3, 28, 256, 256])
        torch.Size([2, 32, 28, 256, 256])
        1
        torch.Size([2, 64, 28, 128, 128])
        torch.Size([2, 3, 28, 128, 128])
        torch.Size([2, 64, 28, 128, 128])
        
        2
        torch.Size([2, 128, 28, 64, 64])
        torch.Size([2, 3, 28, 64, 64])
        torch.Size([2, 128, 28, 64, 64])
        3
        torch.Size([2, 256, 14, 32, 32])
        torch.Size([2, 3, 14, 32, 32])
        torch.Size([2, 256, 14, 32, 32])
        4
        torch.Size([2, 320, 7, 16, 16])
        torch.Size([2, 3, 7, 16, 16])
        torch.Size([2, 320, 7, 16, 16])
        5
        torch.Size([2, 320, 7, 8, 8])
        torch.Size([2, 3, 7, 8, 8])
        torch.Size([2, 320, 7, 8, 8])
        6
        torch.Size([2, 320, 7, 4, 4])
        '''
        fts.append(skips[-1])
        projected_fts = [proj(ft) for ft, proj in zip(fts, self.projections)]
        for i in range(1, len(projected_fts)):
            projected_fts[i] = F.interpolate(projected_fts[i], size=projected_fts[0].shape[2:], mode='trilinear', align_corners=True)
        
        projected_ft = torch.cat(projected_fts, dim=1)
        projected_ft = self.cls_conv(projected_ft)
        projected_ft = nn.AdaptiveMaxPool3d((1, 1, 1))(projected_ft)[:, :, 0, 0, 0]

        return seg_outputs, self.classifier(projected_ft)

    def load_from(self, ckpt_path):
        state_dict = torch.load(ckpt_path, weights_only=False)['network_weights']
        self.load_state_dict(state_dict, strict=False)

    def fix_unet(self, fix=True):
        if fix:
            if not self.unet_fixed:
                for params in self.encoder.parameters():
                    params.requires_grad = False
                for params in self.decoder.parameters():
                    params.requires_grad = False
                self.unet_fixed = True
        else:
            if self.unet_fixed:
                for params in self.encoder.parameters():
                    params.requires_grad = True
                for params in self.decoder.parameters():
                    params.requires_grad = True
                self.unet_fixed = False
                
    def compute_conv_feature_map_size(self, input_size):
        assert len(input_size) == convert_conv_op_to_dim(self.encoder.conv_op), "just give the image size without color/feature channels or " \
                                                            "batch channel. Do not give input_size=(b, c, x, y(, z)). " \
                                                            "Give input_size=(x, y(, z))!"
        return self.encoder.compute_conv_feature_map_size(input_size) + self.decoder.compute_conv_feature_map_size(input_size)

    @staticmethod
    def initialize(module):
        InitWeights_He(1e-2)(module)



class PlainConvUNetClsDownFea(PlainConvUNetCls):
    def __init__(self,
                 input_channels: int,
                 n_stages: int,
                 features_per_stage: Union[int, List[int], Tuple[int, ...]],
                 conv_op: Type[_ConvNd],
                 kernel_sizes: Union[int, List[int], Tuple[int, ...]],
                 strides: Union[int, List[int], Tuple[int, ...]],
                 n_conv_per_stage: Union[int, List[int], Tuple[int, ...]],
                 num_classes: int,
                 n_conv_per_stage_decoder: Union[int, Tuple[int, ...], List[int]],
                 conv_bias: bool = False,
                 norm_op: Union[None, Type[nn.Module]] = None,
                 norm_op_kwargs: dict = None,
                 dropout_op: Union[None, Type[_DropoutNd]] = None,
                 dropout_op_kwargs: dict = None,
                 nonlin: Union[None, Type[torch.nn.Module]] = None,
                 nonlin_kwargs: dict = None,
                 deep_supervision: bool = False,
                 nonlin_first: bool = False,
                 num_cls_classes: int = None,
                 norm_dim = 32
                 ):
        """
        nonlin_first: if True you get conv -> nonlin -> norm. Else it's conv -> norm -> nonlin
        """
        super().__init__(input_channels, n_stages, features_per_stage, conv_op, kernel_sizes, strides, n_conv_per_stage, num_classes, n_conv_per_stage_decoder, conv_bias, norm_op,
                 norm_op_kwargs, dropout_op, dropout_op_kwargs, nonlin, nonlin_kwargs, deep_supervision, nonlin_first, num_cls_classes, norm_dim)
    
    def forward(self, x, sliding_window=True):

        ##################### debug
        for name,params in self.encoder.named_parameters():
            if params.requires_grad:
                break
        for name,params in self.decoder.named_parameters():
            if params.requires_grad:
                break
        #####################
        skips = self.encoder(x)

        # add zhongwei
        seg_outputs = self.decoder(skips)
        fts = self.decoder.get_fts()

        fts.append(skips[-1])
        projected_fts = [proj(ft) for ft, proj in zip(fts, self.projections)]
        for i in range(0, len(projected_fts)):
            projected_fts[i] = F.interpolate(projected_fts[i], size=projected_fts[-1].shape[2:], mode='trilinear', align_corners=True)
        
        projected_ft = torch.cat(projected_fts, dim=1)
        projected_ft = self.cls_conv(projected_ft)
        projected_ft = nn.AdaptiveMaxPool3d((1, 1, 1))(projected_ft)[:, :, 0, 0, 0]

        return seg_outputs, self.classifier(projected_ft)

class PlainConvUNetClsDownFea_NormDim64(PlainConvUNetClsDownFea):
    def __init__(self,
                 input_channels: int,
                 n_stages: int,
                 features_per_stage: Union[int, List[int], Tuple[int, ...]],
                 conv_op: Type[_ConvNd],
                 kernel_sizes: Union[int, List[int], Tuple[int, ...]],
                 strides: Union[int, List[int], Tuple[int, ...]],
                 n_conv_per_stage: Union[int, List[int], Tuple[int, ...]],
                 num_classes: int,
                 n_conv_per_stage_decoder: Union[int, Tuple[int, ...], List[int]],
                 conv_bias: bool = False,
                 norm_op: Union[None, Type[nn.Module]] = None,
                 norm_op_kwargs: dict = None,
                 dropout_op: Union[None, Type[_DropoutNd]] = None,
                 dropout_op_kwargs: dict = None,
                 nonlin: Union[None, Type[torch.nn.Module]] = None,
                 nonlin_kwargs: dict = None,
                 deep_supervision: bool = False,
                 nonlin_first: bool = False,
                 num_cls_classes: int = None,
                 norm_dim = 64
                 ):
        """
        nonlin_first: if True you get conv -> nonlin -> norm. Else it's conv -> norm -> nonlin
        """
        super().__init__(input_channels, n_stages, features_per_stage, conv_op, kernel_sizes, strides, n_conv_per_stage, num_classes, n_conv_per_stage_decoder, conv_bias, norm_op,
                 norm_op_kwargs, dropout_op, dropout_op_kwargs, nonlin, nonlin_kwargs, deep_supervision, nonlin_first, num_cls_classes, norm_dim)

class PlainConvUNetClsDownFea8(PlainConvUNetCls):
    def __init__(self,
                 input_channels: int,
                 n_stages: int,
                 features_per_stage: Union[int, List[int], Tuple[int, ...]],
                 conv_op: Type[_ConvNd],
                 kernel_sizes: Union[int, List[int], Tuple[int, ...]],
                 strides: Union[int, List[int], Tuple[int, ...]],
                 n_conv_per_stage: Union[int, List[int], Tuple[int, ...]],
                 num_classes: int,
                 n_conv_per_stage_decoder: Union[int, Tuple[int, ...], List[int]],
                 conv_bias: bool = False,
                 norm_op: Union[None, Type[nn.Module]] = None,
                 norm_op_kwargs: dict = None,
                 dropout_op: Union[None, Type[_DropoutNd]] = None,
                 dropout_op_kwargs: dict = None,
                 nonlin: Union[None, Type[torch.nn.Module]] = None,
                 nonlin_kwargs: dict = None,
                 deep_supervision: bool = False,
                 nonlin_first: bool = False,
                 num_cls_classes: int = None,
                 norm_dim = 32
                 ):
        """
        nonlin_first: if True you get conv -> nonlin -> norm. Else it's conv -> norm -> nonlin
        """
        super().__init__(input_channels, n_stages, features_per_stage, conv_op, kernel_sizes, strides, n_conv_per_stage, num_classes, n_conv_per_stage_decoder, conv_bias, norm_op,
                 norm_op_kwargs, dropout_op, dropout_op_kwargs, nonlin, nonlin_kwargs, deep_supervision, nonlin_first, num_cls_classes, norm_dim)
    
    def forward(self, x, sliding_window=True):

        ##################### debug
        for name,params in self.encoder.named_parameters():
            if params.requires_grad:
                break
        for name,params in self.decoder.named_parameters():
            if params.requires_grad:
                break
        #####################
        skips = self.encoder(x)

        # add zhongwei
        seg_outputs = self.decoder(skips)
        fts = self.decoder.get_fts()

        fts.append(skips[-1])
        projected_fts = [proj(ft) for ft, proj in zip(fts, self.projections)]
        for i in range(0, len(projected_fts)):
            projected_fts[i] = F.interpolate(projected_fts[i], size=projected_fts[-2].shape[2:], mode='trilinear', align_corners=True)
        
        projected_ft = torch.cat(projected_fts, dim=1)
        projected_ft = self.cls_conv(projected_ft)
        projected_ft = nn.AdaptiveMaxPool3d((1, 1, 1))(projected_ft)[:, :, 0, 0, 0]

        return seg_outputs, self.classifier(projected_ft)

class ResidualEncoderUNetClsDownFea4(nn.Module):
    def __init__(self,
                 input_channels: int,
                 n_stages: int,
                 features_per_stage: Union[int, List[int], Tuple[int, ...]],
                 conv_op: Type[_ConvNd],
                 kernel_sizes: Union[int, List[int], Tuple[int, ...]],
                 strides: Union[int, List[int], Tuple[int, ...]],
                 n_blocks_per_stage: Union[int, List[int], Tuple[int, ...]],
                 num_classes: int,
                 n_conv_per_stage_decoder: Union[int, Tuple[int, ...], List[int]],
                 conv_bias: bool = False,
                 norm_op: Union[None, Type[nn.Module]] = None,
                 norm_op_kwargs: dict = None,
                 dropout_op: Union[None, Type[_DropoutNd]] = None,
                 dropout_op_kwargs: dict = None,
                 nonlin: Union[None, Type[torch.nn.Module]] = None,
                 nonlin_kwargs: dict = None,
                 deep_supervision: bool = False,
                 block: Union[Type[BasicBlockD], Type[BottleneckD]] = BasicBlockD,
                 bottleneck_channels: Union[int, List[int], Tuple[int, ...]] = None,
                 stem_channels: int = None,
                 num_cls_classes: int = None,
                 norm_dim = 32
                 ):
        super().__init__()
        if isinstance(n_blocks_per_stage, int):
            n_blocks_per_stage = [n_blocks_per_stage] * n_stages
        if isinstance(n_conv_per_stage_decoder, int):
            n_conv_per_stage_decoder = [n_conv_per_stage_decoder] * (n_stages - 1)
        assert len(n_blocks_per_stage) == n_stages, "n_blocks_per_stage must have as many entries as we have " \
                                                  f"resolution stages. here: {n_stages}. " \
                                                  f"n_blocks_per_stage: {n_blocks_per_stage}"
        assert len(n_conv_per_stage_decoder) == (n_stages - 1), "n_conv_per_stage_decoder must have one less entries " \
                                                                f"as we have resolution stages. here: {n_stages} " \
                                                                f"stages, so it should have {n_stages - 1} entries. " \
                                                                f"n_conv_per_stage_decoder: {n_conv_per_stage_decoder}"
        self.encoder = ResidualEncoder(input_channels, n_stages, features_per_stage, conv_op, kernel_sizes, strides,
                                       n_blocks_per_stage, conv_bias, norm_op, norm_op_kwargs, dropout_op,
                                       dropout_op_kwargs, nonlin, nonlin_kwargs, block, bottleneck_channels,
                                       return_skips=True, disable_default_stem=False, stem_channels=stem_channels)
        self.decoder = UNetDecoder(self.encoder, num_classes, n_conv_per_stage_decoder, deep_supervision)


        #class zhongwei
        self.num_cls_classes = num_cls_classes
        self.unet_fixed = False
        self.norm_dim = norm_dim
        self.projections = nn.ModuleList()
        for i in range(n_stages):
            #for example: 5,4,3,2,1
            self.projections.append(
                nn.Sequential(
                    nn.Conv3d(features_per_stage[i], self.norm_dim, kernel_size=1), 
                    nn.InstanceNorm3d(self.norm_dim, affine=True), 
                    nn.ReLU(inplace=True))
            )
        out_dim = self.norm_dim * n_stages
        self.cls_conv = nn.Sequential(
            nn.Conv3d(out_dim, out_dim, kernel_size=1),
            nn.InstanceNorm3d(out_dim, affine=True), 
            nn.ReLU(inplace=True))
        self.classifier = nn.Linear(out_dim, self.num_cls_classes)

    def forward(self, x, sliding_window=True):
        ##################### debug
        for name,params in self.encoder.named_parameters():
            if params.requires_grad:
                break
        for name,params in self.decoder.named_parameters():
            if params.requires_grad:
                break
        #####################
        skips = self.encoder(x)

        # add zhongwei
        seg_outputs = self.decoder(skips)

        fts = self.decoder.get_fts()

        fts.append(skips[-1])
        projected_fts = [proj(ft) for ft, proj in zip(fts, self.projections)]
        for i in range(len(projected_fts)):
            projected_fts[i] = F.interpolate(projected_fts[i], size=projected_fts[-1].shape[2:], mode='trilinear', align_corners=True)
        
        # print(len(projected_fts))
        # for x in projected_fts:
        #     print(x.shape)
        # assert False
        projected_ft = torch.cat(projected_fts, dim=1)
        projected_ft = self.cls_conv(projected_ft)
        projected_ft = nn.AdaptiveMaxPool3d((1, 1, 1))(projected_ft)[:, :, 0, 0, 0]

        return seg_outputs, self.classifier(projected_ft)
            
    def load_from(self, ckpt_path):
        state_dict = torch.load(ckpt_path, weights_only=False)['network_weights']
        self.load_state_dict(state_dict, strict=False)

    def fix_unet(self, fix=True):
        if fix:
            if not self.unet_fixed:
                for params in self.encoder.parameters():
                    params.requires_grad = False
                for params in self.decoder.parameters():
                    params.requires_grad = False
                self.unet_fixed = True
        else:
            if self.unet_fixed:
                for params in self.encoder.parameters():
                    params.requires_grad = True
                for params in self.decoder.parameters():
                    params.requires_grad = True
                self.unet_fixed = False

    def compute_conv_feature_map_size(self, input_size):
        assert len(input_size) == convert_conv_op_to_dim(self.encoder.conv_op), "just give the image size without color/feature channels or " \
                                                                                "batch channel. Do not give input_size=(b, c, x, y(, z)). " \
                                                                                "Give input_size=(x, y(, z))!"
        return self.encoder.compute_conv_feature_map_size(input_size) + self.decoder.compute_conv_feature_map_size(input_size)

    @staticmethod
    def initialize(module):
        InitWeights_He(1e-2)(module)
        init_last_bn_before_add_to_0(module)


class ResidualUNet(nn.Module):
    def __init__(self,
                 input_channels: int,
                 n_stages: int,
                 features_per_stage: Union[int, List[int], Tuple[int, ...]],
                 conv_op: Type[_ConvNd],
                 kernel_sizes: Union[int, List[int], Tuple[int, ...]],
                 strides: Union[int, List[int], Tuple[int, ...]],
                 n_blocks_per_stage: Union[int, List[int], Tuple[int, ...]],
                 num_classes: int,
                 n_conv_per_stage_decoder: Union[int, Tuple[int, ...], List[int]],
                 conv_bias: bool = False,
                 norm_op: Union[None, Type[nn.Module]] = None,
                 norm_op_kwargs: dict = None,
                 dropout_op: Union[None, Type[_DropoutNd]] = None,
                 dropout_op_kwargs: dict = None,
                 nonlin: Union[None, Type[torch.nn.Module]] = None,
                 nonlin_kwargs: dict = None,
                 deep_supervision: bool = False,
                 block: Union[Type[BasicBlockD], Type[BottleneckD]] = BasicBlockD,
                 bottleneck_channels: Union[int, List[int], Tuple[int, ...]] = None,
                 stem_channels: int = None
                 ):
        super().__init__()
        if isinstance(n_blocks_per_stage, int):
            n_blocks_per_stage = [n_blocks_per_stage] * n_stages
        if isinstance(n_conv_per_stage_decoder, int):
            n_conv_per_stage_decoder = [n_conv_per_stage_decoder] * (n_stages - 1)
        assert len(n_blocks_per_stage) == n_stages, "n_blocks_per_stage must have as many entries as we have " \
                                                  f"resolution stages. here: {n_stages}. " \
                                                  f"n_blocks_per_stage: {n_blocks_per_stage}"
        assert len(n_conv_per_stage_decoder) == (n_stages - 1), "n_conv_per_stage_decoder must have one less entries " \
                                                                f"as we have resolution stages. here: {n_stages} " \
                                                                f"stages, so it should have {n_stages - 1} entries. " \
                                                                f"n_conv_per_stage_decoder: {n_conv_per_stage_decoder}"
        self.encoder = ResidualEncoder(input_channels, n_stages, features_per_stage, conv_op, kernel_sizes, strides,
                                       n_blocks_per_stage, conv_bias, norm_op, norm_op_kwargs, dropout_op,
                                       dropout_op_kwargs, nonlin, nonlin_kwargs, block, bottleneck_channels,
                                       return_skips=True, disable_default_stem=False, stem_channels=stem_channels)
        self.decoder = UNetResDecoder(self.encoder, num_classes, n_conv_per_stage_decoder, deep_supervision)

    def forward(self, x):
        skips = self.encoder(x)
        return self.decoder(skips)

    def compute_conv_feature_map_size(self, input_size):
        assert len(input_size) == convert_conv_op_to_dim(self.encoder.conv_op), "just give the image size without color/feature channels or " \
                                                                                "batch channel. Do not give input_size=(b, c, x, y(, z)). " \
                                                                                "Give input_size=(x, y(, z))!"
        return self.encoder.compute_conv_feature_map_size(input_size) + self.decoder.compute_conv_feature_map_size(input_size)

    @staticmethod
    def initialize(module):
        InitWeights_He(1e-2)(module)
        init_last_bn_before_add_to_0(module)


if __name__ == '__main__':
    data = torch.rand((1, 4, 128, 128, 128))

    model = PlainConvUNet(4, 6, (32, 64, 125, 256, 320, 320), nn.Conv3d, 3, (1, 2, 2, 2, 2, 2), (2, 2, 2, 2, 2, 2), 4,
                                (2, 2, 2, 2, 2), False, nn.BatchNorm3d, None, None, None, nn.ReLU, deep_supervision=True)

    if False:
        import hiddenlayer as hl

        g = hl.build_graph(model, data,
                           transforms=None)
        g.save("network_architecture.pdf")
        del g

    print(model.compute_conv_feature_map_size(data.shape[2:]))

    data = torch.rand((1, 4, 512, 512))

    model = PlainConvUNet(4, 8, (32, 64, 125, 256, 512, 512, 512, 512), nn.Conv2d, 3, (1, 2, 2, 2, 2, 2, 2, 2), (2, 2, 2, 2, 2, 2, 2, 2), 4,
                                (2, 2, 2, 2, 2, 2, 2), False, nn.BatchNorm2d, None, None, None, nn.ReLU, deep_supervision=True)

    if False:
        import hiddenlayer as hl

        g = hl.build_graph(model, data,
                           transforms=None)
        g.save("network_architecture.pdf")
        del g

    print(model.compute_conv_feature_map_size(data.shape[2:]))
