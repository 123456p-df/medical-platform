import sys
from pathlib import Path

import nibabel as nib
import numpy as np

SCRIPT_DIR = Path(__file__).resolve().parents[1] / "scripts"
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from build_simulation_case import largest_body_mask, slug, structure_type  # noqa: E402


def test_simulation_structure_ids_are_stable_and_safe():
    assert slug("Left Lung / Upper Lobe") == "left_lung_upper_lobe"
    assert slug("###") == "structure"


def test_simulation_structure_type_classifies_bone_labels():
    assert structure_type("skeletal", "Left vertebra") == "bone"
    assert structure_type("thorax", "Liver") == "organ"


def test_largest_body_mask_keeps_the_largest_envelope_and_fills_holes():
    values = np.full((16, 16, 16), -1000.0, dtype=np.float32)
    values[3:13, 3:13, 3:13] = 0.0
    values[7, 7, 7] = -1000.0
    values[0:2, 0:2, 0:2] = 0.0

    image = nib.Nifti1Image(values, np.eye(4))
    mask = largest_body_mask(image)

    assert mask.dtype == np.bool_
    assert mask[7, 7, 7]
    assert int(mask.sum()) == 1000
    assert not mask[0, 0, 0]
