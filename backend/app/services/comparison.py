from app.models import MedicalImage


SPACING_TOLERANCE = 0.20
FOV_TOLERANCE = 0.25


def _vector(values, fallback=None):
    if not values:
        return fallback
    return [float(value) for value in values[:3]]


def _relative_diff(left, right):
    if left is None or right is None or len(left) < 3 or len(right) < 3:
        return None
    diffs = []
    for a, b in zip(left, right):
        scale = max(abs(a), abs(b), 1e-6)
        diffs.append(abs(a - b) / scale)
    return diffs


def acquisition_of(image: MedicalImage) -> dict:
    stored = dict(image.acquisition or {})
    shape = stored.get("shape") or image.shape
    spacing = stored.get("spacing_mm") or image.spacing
    fov = stored.get("fov_mm")
    if (not fov) and shape and spacing:
        fov = [float(s) * float(p) for s, p in zip(shape[:3], spacing[:3])]
    return {
        "shape": [int(v) for v in shape[:3]] if shape else None,
        "spacing_mm": _vector(spacing),
        "fov_mm": _vector(fov),
        "orientation": stored.get("orientation") or "RAS",
        "device": (stored.get("device") or "").strip() or None,
        "affine": stored.get("affine"),
    }


def compare_studies(primary: MedicalImage, candidate: MedicalImage) -> dict:
    reasons: list[str] = []
    warnings: list[str] = []
    if primary.patient_id != candidate.patient_id:
        reasons.append("不是同一患者")
    if primary.image_type != "CT" or candidate.image_type != "CT":
        reasons.append("只支持 CT 与 CT 对比")
    left = acquisition_of(primary)
    right = acquisition_of(candidate)
    has_world = left["affine"] is not None and right["affine"] is not None
    if left["orientation"] != right["orientation"]:
        (warnings if has_world else reasons).append("影像方向不同，按世界坐标重采样")
    spacing_diff = _relative_diff(left["spacing_mm"], right["spacing_mm"])
    if spacing_diff is None:
        reasons.append("缺少体素间距")
    elif max(spacing_diff) > SPACING_TOLERANCE and not has_world:
        reasons.append("体素间距相差超过 20%")
    elif max(spacing_diff) > SPACING_TOLERANCE:
        warnings.append("体素间距不同，将按世界坐标重采样")
    fov_diff = _relative_diff(left["fov_mm"], right["fov_mm"])
    if fov_diff is None:
        reasons.append("缺少视野信息")
    elif max(fov_diff) > FOV_TOLERANCE and not has_world:
        reasons.append("扫描视野相差超过 25%")
    elif max(fov_diff) > FOV_TOLERANCE:
        warnings.append("扫描视野不同，将按世界坐标裁剪")
    if left["device"] and right["device"] and left["device"] != right["device"]:
        warnings.append("采集设备不同")
    elif not left["device"] or not right["device"]:
        warnings.append("设备信息缺失，按几何相似允许对比")
    return {
        "image_id": candidate.id,
        "patient_id": candidate.patient_id,
        "image_type": candidate.image_type,
        "organ_id": candidate.organ_id,
        "study_date": candidate.study_date,
        "shape": candidate.shape,
        "spacing": candidate.spacing,
        "comparable": not reasons,
        "reasons": reasons,
        "warnings": warnings if not reasons else [],
        "device": right["device"],
        "world_matrix": right["affine"],
    }
