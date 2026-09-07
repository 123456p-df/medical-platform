import nibabel as nib
import numpy as np

from app.adapters.nv_segment_ct import NVSegmentCT


def test_nvidia_wrapper_uses_organ_labels_and_excludes_unknown_voxels(
    app_env, nifti_file, tmp_path
):
    """Exercise the file contract of the official pipeline without claiming model accuracy."""
    _, _, settings, _ = app_env
    adapter = NVSegmentCT(settings)
    called = []

    def pipeline(inputs, **kwargs):
        called.append(inputs)
        original = nib.load(inputs["image"])
        values = np.zeros(original.shape, dtype=np.float32)
        for index, label in enumerate([28, 29, 30, 31, 32]):
            values[index, 2, 2] = label
        values[8, 2, 2] = 255  # Upstream unknown / NaN sentinel.
        values[9, 2, 2] = 1  # A different organ must not enter the lung mask.
        nib.save(
            nib.Nifti1Image(values, original.affine, original.header),
            tmp_path / "job" / "raw" / "prediction.nii.gz",
        )

    adapter.pipeline = pipeline
    output_dir = tmp_path / "job"
    output_dir.mkdir()
    progress = []
    mask_path = adapter(
        image_path=nifti_file, organ_id="lung", output_dir=output_dir, progress=progress.append
    )
    mask = nib.load(mask_path)
    assert called[0]["label_prompt"] == [28, 29, 30, 31, 32]
    assert np.sum(mask.get_fdata()) == 5
    assert mask.get_fdata()[8, 2, 2] == mask.get_fdata()[9, 2, 2] == 0
    np.testing.assert_allclose(mask.affine, nib.load(nifti_file).affine)
    assert adapter.image_types == {"CT"}
    assert progress == [20, 75]
