import numpy as np

from app.services.geometry_engine import (
    build_ct_lung_supports,
    extract_subvoxel_surface_from_mask,
    largest_connected_component_voxels,
    repair_anatomical_mask,
)


def test_largest_component_matches_rendered_surface_connectivity():
    mask = np.zeros((6, 6, 6), dtype=bool)
    mask[1, 1, 1] = True
    mask[2, 2, 2] = True
    mask[5, 5, 5] = True

    assert largest_connected_component_voxels(mask) == 1


def test_solid_organ_repair_keeps_one_anatomical_primary_component():
    mask = np.zeros((32, 24, 24), dtype=bool)
    mask[2:12, 2:12, 2:12] = True
    mask[20:28, 4:12, 4:12] = True

    repaired, metadata = repair_anatomical_mask(
        mask,
        organ_id="heart",
        min_component_voxels=50,
    )

    assert repaired.sum() == 1000
    assert repaired[3, 3, 3]
    assert not repaired[21, 5, 5]
    assert metadata["component_policy"] == "primary_component"
    assert metadata["original_component_count"] == 2
    assert metadata["retained_component_count"] == 1


def test_multipart_anatomy_preserves_meaningful_components_only():
    mask = np.zeros((40, 30, 30), dtype=bool)
    mask[2:12, 2:12, 2:12] = True
    mask[20:25, 3:8, 3:8] = True
    mask[35:37, 20:22, 20:22] = True

    repaired, metadata = repair_anatomical_mask(mask, organ_id="costal cartilages")

    assert repaired.sum() == 1125
    assert metadata["component_policy"] == "anatomical_multipart"
    assert metadata["retained_component_count"] == 2


def test_rib_repair_keeps_meaningful_arc_segments_but_drops_noise():
    mask = np.zeros((48, 32, 32), dtype=bool)
    mask[2:18, 4:12, 4:12] = True
    mask[24:34, 5:11, 5:11] = True
    mask[44:46, 28:30, 28:30] = True

    repaired, metadata = repair_anatomical_mask(
        mask,
        organ_id="right rib 7",
        min_component_voxels=128,
    )

    assert repaired.sum() == 1384
    assert repaired[25, 6, 6]
    assert not repaired[44, 28, 28]
    assert metadata["component_policy"] == "elongated_fragment_recovery"
    assert metadata["retained_component_count"] == 2


def test_diseased_lung_repair_keeps_a_substantial_separated_region():
    mask = np.zeros((48, 32, 32), dtype=bool)
    mask[2:22, 3:23, 3:23] = True
    mask[28:38, 5:15, 5:15] = True
    mask[44:46, 28:30, 28:30] = True

    repaired, metadata = repair_anatomical_mask(
        mask,
        organ_id="left lung lower lobe",
        min_component_voxels=128,
    )

    assert repaired.sum() == 9000
    assert repaired[30, 8, 8]
    assert not repaired[44, 28, 28]
    assert metadata["component_policy"] == "elongated_fragment_recovery"
    assert metadata["retained_component_count"] == 2


def test_ct_lung_supports_keep_two_coherent_sides_and_drop_replicas():
    labels = np.zeros((48, 24, 24), dtype=np.uint8)
    labels[2:10, 4:16, 4:16] = 28
    labels[36:44, 4:16, 4:16] = 30
    labels[18:22, 6:14, 6:14] = 29

    supports = build_ct_lung_supports(labels, min_component_voxels=100)

    assert set(supports) == {"left_lung", "right_lung"}
    assert supports["left_lung"][3, 5, 5]
    assert not supports["left_lung"][19, 7, 7]
    assert supports["right_lung"][37, 5, 5]
    assert not np.any(supports["left_lung"] & supports["right_lung"])


def test_mesh_extraction_reports_repaired_topology():
    mask = np.zeros((32, 24, 24), dtype=bool)
    mask[2:12, 2:12, 2:12] = True
    mask[20:28, 4:12, 4:12] = True

    mesh, metadata = extract_subvoxel_surface_from_mask(
        mask,
        np.eye(4),
        target_faces=10_000,
        organ_id="liver",
        sdf_sigma=0,
    )

    assert len(mesh.split(only_watertight=False)) == 1
    assert metadata["topology"]["original_component_count"] == 2
    assert metadata["topology"]["retained_component_count"] == 1
