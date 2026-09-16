# DICOM to examination conversion

## Boundary

The API does not decode DICOM bytes itself. `ORTHANC_URL` must point to an Orthanc instance with the
`/series/{id}/nifti` endpoint enabled. Instances are first associated through
`POST /api/v1/dicom/instances`; a doctor can then convert one linked series with:

```text
POST /api/v1/dicom/series/{series_id}/convert
{"organ_id": "lung"}
```

The conversion writes a gzip-compressed NIfTI file into the configured storage root, creates a
`MedicalImage`, and backfills `DicomSeries.medical_image_id`. The study becomes `ready`, and the
series then appears in the normal catalog, report, AI, and viewer workflows.

## Requirements

- Orthanc `/series/{id}/nifti` must be enabled and reachable from the API container.
- Only CT and MRI series are converted to examination images. DX/CR remain readable at the DICOM
  boundary and are rejected by conversion with code `40012`.
- Storage path stays inside `STORAGE_ROOT`.
- Repeating conversion is idempotent and returns the existing `medical_image_id`.

## Verification status

- Synthetic adapter tests cover Orthanc association, CT conversion, backfill, catalog visibility,
  idempotency, and cross-patient protection.
- The actual Orthanc `/series/{id}/nifti` endpoint has not yet been exercised with a real Orthanc
  deployment or a real compressed-transfer-syntax study.
