# MRI 支持

生产浏览体积仍是 canonical RAS NIfTI。DICOM 只作为入口，导入后转换成 `.nii.gz`。

## 分割

| 情况 | NV-Segment-CTMR modality |
| --- | --- |
| CT | `CT_BODY` |
| 身体 MRI，或非 T1 脑 MRI | `MRI_BODY` |
| `organ_id=brain` 且序列为 T1 | `MRI_BRAIN`（先 SynthStrip 去颅，再强度归一化） |

肺结节检测仍只接受 CT。MRI 肺标签为 135/136，没有叶分段。

`MRI_BRAIN` 需要主机安装 `mri_synthstrip`（或设置 `SYNTHSTRIP_COMMAND`）。未安装时该批次失败，不影响 `MRI_BODY`。

## 序列

自动识别来源：DICOM SeriesDescription / ProtocolName / ImageType / TR+TE，或 NIfTI 文件名与 `descrip`。读不到则为 `unknown`，医生可 PATCH。

## DICOM

一次上传只能包含一个 SeriesInstanceUID。推荐 zip 一个序列，或安装 `dcm2niix`（`DCM2NIIX_COMMAND`）。不支持 4D / 多 b 值 / DCE。

## 比较

只比较同一模态：CT–CT 或 MRI–MRI。序列不同会警告，仍可按相对层位联动。
