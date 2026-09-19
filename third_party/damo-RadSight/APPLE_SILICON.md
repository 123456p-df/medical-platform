Vendored from https://github.com/alibaba-damo-academy/damo-RadSight (Apache-2.0).

Local patches for this platform:

- Default attention is `sdpa` instead of `flash_attention_2`.
- `mm_infer` moves tensors to the model's device instead of hard-coding `.cuda()`.
