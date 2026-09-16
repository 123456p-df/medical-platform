# PulmoLink capability matrix

| Capability | Synthetic demo | Local browser import | Real API |
|---|---|---|---|
| Identity source | Bundled demo accounts and roster | Current browser account namespace | PostgreSQL users and access grants |
| Patient onboarding | Synthetic local profile | Supported | `PATCH /patient/onboarding` |
| Doctor invitation binding | Local one-time code | Supported in browser | `patient_link_invitations` with hashed tokens |
| Report drafts | LocalStorage per account | LocalStorage | PostgreSQL with `0014_record_draft_default` |
| Signed report visibility | Local mock delivery | Local signed state | Reviewed records only |
| NIfTI upload | Disabled, labeled synthetic | Not supported | `POST /patients/{id}/medical-images` |
| DICOM import | Browser IndexedDB viewer | Supported in browser | Authenticated Orthanc `/dicom/instances` |
| DICOM conversion | N/A | N/A | `POST /dicom/series/{id}/convert` when Orthanc NIfTI endpoint is available |
| AI chat | Synthetic disabled state | Disabled with capability reason | `/ai/chat` when AI provider configured |
| Organ segmentation | Disabled with capability reason | Disabled with capability reason | `/medical-images/{id}/segmentation` |
| Nodule detection | Disabled with capability reason | Disabled with capability reason | `/analysis/tasks` when model configured |
| 3D models | Bundled public GLB assets | Bundled public GLB assets | Segmentation/default GLB from API |
| Patient list | Roster in LocalStorage | Roster in LocalStorage | Server pagination and filters |
| Archive workflow | Local archive records | Local archive records | `patient_archives` with reason and operator audit |

## Persistence

- Demo accounts and local imports are stored in browser storage with account-scoped keys.
- Real API writes reports, images, archives, invitations, DICOM metadata, and findings to PostgreSQL.
- Clinical text and DICOM tags remain in their original language; interface text uses the active locale.

## External dependencies

- PostgreSQL: required by real API mode.
- Orthanc: required for DICOM archive and conversion.
- NVIDIA/MONAI GPU runtime: required for segmentation and nodule detection.
