from .radsight_encoder.vit import ViT3DTower


def build_vision_tower(config, **kwargs):
    vision_tower = getattr(config, 'ct_vision_encoder', None)
    if 'nnunet' in vision_tower.lower():
        return ViT3DTower(config, **kwargs)
    else:
        raise ValueError(f'Unknown vision tower: {vision_tower}')