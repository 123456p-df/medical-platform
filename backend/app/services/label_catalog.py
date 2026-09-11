"""Stable label metadata for the all-label NV-Segment-CT batch output."""

import json
from pathlib import Path


_FALLBACK = {
    1: "liver",
    3: "spleen",
    4: "pancreas",
    5: "right kidney",
    12: "stomach",
    14: "left kidney",
    22: "brain",
    28: "left lung",
    29: "right lung",
    30: "airways",
    31: "trachea",
    32: "lung",
    115: "heart",
}


_ZH = {
    "liver": "肝",
    "spleen": "脾",
    "pancreas": "胰",
    "right kidney": "右肾",
    "left kidney": "左肾",
    "kidney": "肾",
    "stomach": "胃",
    "brain": "脑",
    "left lung": "左肺",
    "right lung": "右肺",
    "lung": "肺",
    "airways": "气道",
    "trachea": "气管",
    "heart": "心",
    "aorta": "主动脉",
    "gallbladder": "胆囊",
    "colon": "结肠",
    "esophagus": "食管",
    "bladder": "膀胱",
    "prostate": "前列腺",
    "thyroid": "甲状腺",
    "skull": "颅骨",
    "sternum": "胸骨",
    "sacrum": "骶骨",
    "spinal cord": "脊髓",
    "rib": "肋骨",
    "vertebrae": "椎骨",
    "vein": "静脉",
    "artery": "动脉",
    "muscle": "肌肉",
}


def _group(name: str) -> str | None:
    lower = name.lower()
    for key in (
        "liver", "kidney", "spleen", "pancreas", "stomach", "lung",
        "brain", "heart", "aorta", "vein", "artery", "vertebra",
        "bone", "rib", "muscle",
    ):
        if key in lower:
            return key
    return None


def display_name(name: str) -> str:
    lower = (name or "").lower().replace("_", " ")
    if lower in _ZH:
        return _ZH[lower]
    for key, value in sorted(_ZH.items(), key=lambda item: -len(item[0])):
        if key in lower:
            prefix = ""
            if "left" in lower and "左" not in value:
                prefix = "左"
            elif "right" in lower and "右" not in value:
                prefix = "右"
            return prefix + value
    return name


class LabelCatalog:
    def __init__(self, root: Path | None):
        self.labels = self._load(root)

    @staticmethod
    def _load(root: Path | None) -> dict[int, str]:
        labels: dict[int, str] = dict(_FALLBACK)
        if root:
            for candidate in (
                root / "metadata.json",
                root / "vista3d_pretrained_model" / "metadata.json",
            ):
                try:
                    data = json.loads(candidate.read_text(encoding="utf-8"))
                    values = (
                        data.get("network_data_format", {})
                        .get("everything_labels", {})
                        .get("CT_BODY", {})
                    )
                    if values:
                        labels.update({int(key): str(value) for key, value in values.items()})
                        break
                except (OSError, ValueError, TypeError):
                    continue
        labels.pop(0, None)
        return labels

    def describe(self, label_id: int) -> dict:
        name = self.labels.get(label_id, f"标签-{label_id}")
        return {
            "label_id": label_id,
            "name": name,
            "display_name": display_name(name),
            "organ_id": f"label_{label_id}",
            "group_id": _group(name),
        }
