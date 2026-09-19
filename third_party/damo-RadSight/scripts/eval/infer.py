import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../..'))
import torch
from radsight import disable_torch_init, model_init, mm_infer
from radsight.model import load_pretrained_model
from radsight.mm_utils import load_images, get_model_name_from_path, load_3D
from radsight.model.processor import RadSightProcessor

os.environ["CUDA_VISIBLE_DEVICES"] = "0"
model_path = "/path/to/RadSight_Weights/"
model_name = get_model_name_from_path(model_path)
tokenizer, model, image_processor, context_len = load_pretrained_model(model_path, None, model_name, device_map={"": "cuda:0"})
processor = RadSightProcessor(image_processor, tokenizer)
model.config.use_token_compression=False


# 3D CT
slices = load_3D("path/to/your/model")
slices_image = slices['image']
if slices_image.shape[0] == 2:
    slices_image = slices_image[[0]]
conversation = [
        {
            "role": "user",
            "content": [
               {"type": "video", "num_frames": 12},
                {"type": "text", "text": "Please generate a medical report based on this image."},
            ]
        }
    ]
modal='volume'
model=model.to("cuda:0")
inputs = processor(
        images=[slices_image] if modal != "text" else None,
        text=conversation,
        merge_size=2 if modal == "video" else 1,
        modal="volume",
        return_tensors="pt"
        )
inputs = {k: v.cuda().to('cuda:0') if isinstance(v, torch.Tensor) else v for k, v in inputs.items()}
if "pixel_values" in inputs:
    inputs["pixel_values"] = inputs["pixel_values"].to(torch.bfloat16)
with torch.inference_mode():
        output_ids = model.generate(
            **inputs,
            do_sample=True,
            modals=[modal],
            temperature=0.6,
            max_new_tokens=8192,
            use_cache=True,
            pad_token_id=tokenizer.eos_token_id,
        )
outputs = tokenizer.batch_decode(output_ids, skip_special_tokens=True)[0].strip()
print(outputs)

# 2D X-Ray
slices = load_images("path/to/your/model")
conversation = [
        {
            "role": "user",
            "content": [
               {"type": "image",},
                {"type": "text", "text": "Please generate a medical report based on this image."},
            ]
        }
    ]
modal='image'
model=model.to("cuda:0")
inputs = processor(
        images=[slices] if modal != "text" else None,
        text=conversation,
        merge_size=2 if modal == "video" else 1,
        modal="image",
        return_tensors="pt"
        )
inputs = {k: v.cuda().to('cuda:0') if isinstance(v, torch.Tensor) else v for k, v in inputs.items()}
if "pixel_values" in inputs:
    inputs["pixel_values"] = inputs["pixel_values"].to(torch.bfloat16)
with torch.inference_mode():
        output_ids = model.generate(
            **inputs,
            do_sample=True,
            modals=[modal],
            temperature=0.6,
            max_new_tokens=8192,
            use_cache=True,
            pad_token_id=tokenizer.eos_token_id,
        )

outputs = tokenizer.batch_decode(output_ids, skip_special_tokens=True)[0].strip()
print(outputs)
