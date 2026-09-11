from app.services.label_catalog import _group, display_name, group_display_name


def test_ribs_share_a_group_and_keep_distinct_names():
    assert _group("left rib 3") == "rib"
    assert _group("right rib 12") == "rib"
    assert display_name("left rib 3") == "左第3肋"
    assert display_name("right rib 12") == "右第12肋"
    assert group_display_name("rib") == "肋骨"
    assert len({display_name(f"left rib {n}") for n in range(1, 13)}) == 12


def test_vertebrae_and_lungs_group():
    assert _group("vertebrae T11") == "vertebra"
    assert display_name("vertebrae T11") == "T11椎骨"
    assert _group("left lung upper lobe") == "left_lung"
    assert _group("right lung lower lobe") == "right_lung"
    assert group_display_name("left_lung") == "左肺"
