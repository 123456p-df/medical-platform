"""Stable label metadata for the all-label NV-Segment-CT batch output."""

import json
import re
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

_GROUP_LABELS = {
    "rib": "肋骨",
    "vertebra": "椎骨",
    "left_lung": "左肺",
    "right_lung": "右肺",
    "lung": "肺",
    "muscle": "肌肉",
    "artery": "动脉",
    "vein": "静脉",
}

_EXACT_ZH = {
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
    "thyroid gland": "甲状腺",
    "skull": "颅骨",
    "sternum": "胸骨",
    "sacrum": "骶骨",
    "spinal cord": "脊髓",
    "duodenum": "十二指肠",
    "small bowel": "小肠",
    "inferior vena cava": "下腔静脉",
    "superior vena cava": "上腔静脉",
    "portal vein and splenic vein": "门静脉",
    "pulmonary vein": "肺静脉",
    "left adrenal gland": "左肾上腺",
    "right adrenal gland": "右肾上腺",
    "left clavicula": "左锁骨",
    "right clavicula": "右锁骨",
    "left scapula": "左肩胛骨",
    "right scapula": "右肩胛骨",
    "left humerus": "左肱骨",
    "right humerus": "右肱骨",
    "left femur": "左股骨",
    "right femur": "右股骨",
    "left hip": "左髋",
    "right hip": "右髋",
    "costal cartilages": "肋软骨",
    "iliopsoas": "髂腰肌",
    "autochthon": "竖脊肌",
    "gluteus maximus": "臀大肌",
    "left iliopsoas": "左髂腰肌",
    "right iliopsoas": "右髂腰肌",
    "left autochthon": "左竖脊肌",
    "right autochthon": "右竖脊肌",
    "left gluteus maximus": "左臀大肌",
    "right gluteus maximus": "右臀大肌",
    "brachiocephalic trunk": "头臂干",
    "left brachiocephalic vein": "左头臂静脉",
    "right brachiocephalic vein": "右头臂静脉",
    "left common carotid artery": "左颈总动脉",
    "right common carotid artery": "右颈总动脉",
    "left subclavian artery": "左锁骨下动脉",
    "right subclavian artery": "右锁骨下动脉",
    "left atrial appendage": "左心耳",
    "left kidney cyst": "左肾囊肿",
    "right kidney cyst": "右肾囊肿",
}


def _norm(name: str) -> str:
    return (name or "").lower().replace("_", " ").strip()


def _group(name: str) -> str:
    lower = _norm(name)
    if "rib" in lower:
        return "rib"
    if "vertebra" in lower or re.search(r"\b[ctl]\d+\b", lower) or re.search(r"\bs1\b", lower):
        return "vertebra"
    if "left lung" in lower:
        return "left_lung"
    if "right lung" in lower:
        return "right_lung"
    if "iliopsoas" in lower or "autochthon" in lower or "gluteus" in lower or "muscle" in lower:
        return "muscle"
    if "vein" in lower or "vena cava" in lower:
        return "vein"
    if "artery" in lower or "carotid" in lower or "subclavian" in lower or "brachiocephalic trunk" in lower:
        return "artery"
    if "lung" in lower:
        return "lung"
    for key in (
        "liver", "spleen", "pancreas", "stomach", "brain", "heart", "aorta",
        "kidney", "gallbladder", "colon", "esophagus", "bladder", "prostate",
        "thyroid", "skull", "sternum", "sacrum", "duodenum", "airways", "trachea",
    ):
        if key in lower:
            if key == "kidney":
                if "left" in lower:
                    return "left_kidney"
                if "right" in lower:
                    return "right_kidney"
            return key
    return _norm(name).replace(" ", "_") or "other"


def group_display_name(group_id: str) -> str:
    if group_id in _GROUP_LABELS:
        return _GROUP_LABELS[group_id]
    mapped = {
        "left_kidney": "左肾",
        "right_kidney": "右肾",
        "liver": "肝",
        "spleen": "脾",
        "pancreas": "胰",
        "stomach": "胃",
        "brain": "脑",
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
        "duodenum": "十二指肠",
        "airways": "气道",
        "trachea": "气管",
    }
    if group_id in mapped:
        return mapped[group_id]
    return display_name(group_id.replace("_", " "))


def display_name(name: str) -> str:
    lower = _norm(name)
    rib = re.match(r"(left|right)?\s*rib\s*(\d+)", lower)
    if rib:
        side = "左" if rib.group(1) == "left" else "右" if rib.group(1) == "right" else ""
        return f"{side}第{rib.group(2)}肋"
    vertebra = re.search(r"vertebrae\s*([ctls]\d+)|vertebra\s*([ctls]\d+)|\b([ctls]\d+)\b", lower)
    if vertebra:
        code = next(g for g in vertebra.groups() if g)
        return f"{code.upper()}椎骨"
    if lower in _EXACT_ZH:
        return _EXACT_ZH[lower]
    for key, value in sorted(_EXACT_ZH.items(), key=lambda item: -len(item[0])):
        if key == lower or lower.startswith(key + " ") or lower.endswith(" " + key):
            return value
        if len(key) > 5 and key in lower:
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
        group_id = _group(name)
        return {
            "label_id": label_id,
            "name": name,
            "display_name": display_name(name),
            "group_id": group_id,
            "group_name": group_display_name(group_id),
            "organ_id": f"label_{label_id}",
        }
