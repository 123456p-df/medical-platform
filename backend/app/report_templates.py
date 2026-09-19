from __future__ import annotations

from typing import Any

from sqlalchemy import select

from app.errors import APIError
from app.models import ReportTemplate, ReportTemplateVersion, utcnow


DEFAULT_REPORT_TEMPLATES = [
    {
        "id": "template_chest_ct",
        "name": "Chest CT Structured Report",
        "modality": "CT",
        "organ_id": "lung",
        "fields": [
            {
                "key": "technique",
                "label": "ui.reportTemplate.technique",
                "section": "ui.reportTemplate.section.technique",
                "type": "select",
                "required": True,
                "options": [
                    "ui.reportTemplate.technique.nonContrast",
                    "ui.reportTemplate.technique.contrast",
                    "ui.reportTemplate.technique.cta",
                ],
            },
            {
                "key": "comparison",
                "label": "ui.reportTemplate.comparison",
                "section": "ui.reportTemplate.section.clinical",
                "type": "text",
            },
            {
                "key": "lung_findings",
                "label": "ui.reportTemplate.lungFindings",
                "section": "ui.reportTemplate.section.findings",
                "type": "textarea",
                "required": True,
            },
            {
                "key": "mediastinum",
                "label": "ui.reportTemplate.mediastinum",
                "section": "ui.reportTemplate.section.findings",
                "type": "textarea",
            },
            {
                "key": "pleura",
                "label": "ui.reportTemplate.pleura",
                "section": "ui.reportTemplate.section.findings",
                "type": "textarea",
            },
            {
                "key": "nodule_location",
                "label": "ui.reportTemplate.noduleLocation",
                "section": "ui.reportTemplate.section.measurement",
                "type": "text",
            },
            {
                "key": "nodule_long_axis_mm",
                "label": "ui.reportTemplate.noduleLongAxisMm",
                "section": "ui.reportTemplate.section.measurement",
                "type": "number",
                "unit": "mm",
            },
            {
                "key": "nodule_short_axis_mm",
                "label": "ui.reportTemplate.noduleShortAxisMm",
                "section": "ui.reportTemplate.section.measurement",
                "type": "number",
                "unit": "mm",
            },
            {
                "key": "nodule_density",
                "label": "ui.reportTemplate.noduleDensity",
                "section": "ui.reportTemplate.section.measurement",
                "type": "select",
                "options": [
                    "ui.reportTemplate.density.solid",
                    "ui.reportTemplate.density.partSolid",
                    "ui.reportTemplate.density.groundGlass",
                    "ui.reportTemplate.density.calcified",
                ],
            },
            {
                "key": "impression",
                "label": "ui.reportTemplate.impression",
                "section": "ui.reportTemplate.section.impression",
                "type": "textarea",
                "required": True,
            },
            {
                "key": "follow_up",
                "label": "ui.reportTemplate.followUp",
                "section": "ui.reportTemplate.section.impression",
                "type": "textarea",
            },
        ],
    },
    {
        "id": "template_brain_mri",
        "name": "Brain MRI Structured Report",
        "modality": "MRI",
        "organ_id": "brain",
        "fields": [
            {
                "key": "technique",
                "label": "ui.reportTemplate.technique",
                "section": "ui.reportTemplate.section.technique",
                "type": "select",
                "required": True,
                "options": [
                    "ui.reportTemplate.technique.nonContrast",
                    "ui.reportTemplate.technique.contrast",
                ],
            },
            {
                "key": "brain_parenchyma",
                "label": "ui.reportTemplate.brainParenchyma",
                "section": "ui.reportTemplate.section.findings",
                "type": "textarea",
                "required": True,
            },
            {
                "key": "ventricles",
                "label": "ui.reportTemplate.ventricles",
                "section": "ui.reportTemplate.section.findings",
                "type": "textarea",
            },
            {
                "key": "vessels",
                "label": "ui.reportTemplate.vessels",
                "section": "ui.reportTemplate.section.findings",
                "type": "textarea",
            },
            {
                "key": "extra_axial",
                "label": "ui.reportTemplate.extraAxial",
                "section": "ui.reportTemplate.section.findings",
                "type": "textarea",
            },
            {
                "key": "impression",
                "label": "ui.reportTemplate.impression",
                "section": "ui.reportTemplate.section.impression",
                "type": "textarea",
                "required": True,
            },
        ],
    },
    {
        "id": "template_chest_xray",
        "name": "Chest X-Ray Structured Report",
        "modality": "X-Ray",
        "organ_id": "lung",
        "fields": [
            {
                "key": "projection",
                "label": "ui.reportTemplate.projection",
                "section": "ui.reportTemplate.section.technique",
                "type": "select",
                "required": True,
                "options": [
                    "ui.reportTemplate.projection.pa",
                    "ui.reportTemplate.projection.ap",
                    "ui.reportTemplate.projection.lateral",
                ],
            },
            {
                "key": "technique_quality",
                "label": "ui.reportTemplate.techniqueQuality",
                "section": "ui.reportTemplate.section.technique",
                "type": "textarea",
            },
            {
                "key": "lungs",
                "label": "ui.reportTemplate.lungs",
                "section": "ui.reportTemplate.section.findings",
                "type": "textarea",
                "required": True,
            },
            {
                "key": "heart_mediastinum",
                "label": "ui.reportTemplate.heartMediastinum",
                "section": "ui.reportTemplate.section.findings",
                "type": "textarea",
            },
            {
                "key": "bones_soft_tissue",
                "label": "ui.reportTemplate.bonesSoftTissue",
                "section": "ui.reportTemplate.section.findings",
                "type": "textarea",
            },
            {
                "key": "impression",
                "label": "ui.reportTemplate.impression",
                "section": "ui.reportTemplate.section.impression",
                "type": "textarea",
                "required": True,
            },
        ],
    },
]


def template_out(template: ReportTemplate) -> dict:
    return {
        "template_id": template.id,
        "name": template.name,
        "modality": template.modality,
        "organ_id": template.organ_id,
        "version": template.version,
        "is_active": template.is_active,
        "is_default": template.is_default,
        "fields": template.fields,
        "created_at": template.created_at,
        "updated_at": template.updated_at,
    }


def version_out(version: ReportTemplateVersion) -> dict:
    return {
        "version_id": version.id,
        "template_id": version.template_id,
        "version": version.version,
        "name": version.name,
        "modality": version.modality,
        "organ_id": version.organ_id,
        "fields": version.fields,
        "is_active": version.is_active,
        "is_default": version.is_default,
        "created_at": version.created_at,
    }


def snapshot_template(db, template: ReportTemplate, user_id: int | None) -> None:
    db.add(
        ReportTemplateVersion(
            template_id=template.id,
            version=template.version,
            name=template.name,
            modality=template.modality,
            organ_id=template.organ_id,
            fields=template.fields,
            is_active=template.is_active,
            is_default=template.is_default,
            created_by_user_id=user_id,
        )
    )


def normalize_template_fields(fields: list[dict[str, Any]]) -> list[dict[str, Any]]:
    normalized: list[dict[str, Any]] = []
    seen: set[str] = set()
    allowed_types = {"text", "textarea", "number", "date", "select", "boolean"}
    for field in fields:
        key = str(field.get("key", "")).strip()
        field_type = str(field.get("type", "text")).strip()
        if not key:
            raise APIError(422, 42204, "Template field key is required")
        if field_type not in allowed_types:
            raise APIError(422, 42204, f"Unsupported template field type: {field_type}")
        if key in seen:
            raise APIError(422, 42204, f"Duplicate template field key: {key}")
        seen.add(key)
        normalized.append(
            {
                "key": key,
                "label": str(field.get("label") or key),
                "section": str(field.get("section") or "findings"),
                "type": field_type,
                "required": bool(field.get("required", False)),
                "options": [str(item) for item in field.get("options", [])],
                "unit": field.get("unit"),
            }
        )
    return normalized


def validate_structured_data(
    template: ReportTemplate,
    data: dict[str, Any] | None,
) -> dict[str, Any]:
    values = {key: value for key, value in (data or {}).items() if value not in (None, "")}
    field_errors: dict[str, str] = {}
    for field in template.fields:
        key = field["key"]
        value = values.get(key)
        if field.get("required") and value is None:
            field_errors[key] = "This field is required"
            continue
        if value is None:
            continue
        if field["type"] == "number":
            try:
                values[key] = float(value)
            except (TypeError, ValueError):
                field_errors[key] = "A number is required"
        elif field["type"] == "date" and not isinstance(value, str):
            field_errors[key] = "A date string is required"
        elif field["type"] == "boolean" and not isinstance(value, bool):
            field_errors[key] = "A boolean value is required"
        elif field["type"] == "select" and field.get("options") and value not in field["options"]:
            field_errors[key] = "Select a valid option"
    if field_errors:
        raise APIError(422, 42204, "Structured report fields are invalid", field_errors=field_errors)
    return values


def seed_default_report_templates(session_factory) -> None:
    with session_factory() as db:
        existing_ids = set(db.scalars(select(ReportTemplate.id)))
        now = utcnow()
        added = False
        for item in DEFAULT_REPORT_TEMPLATES:
            if item["id"] in existing_ids:
                continue
            template = ReportTemplate(
                id=item["id"],
                name=item["name"],
                modality=item["modality"],
                organ_id=item["organ_id"],
                fields=item["fields"],
                created_by_user_id=None,
                updated_at=now,
            )
            db.add(template)
            db.flush()
            snapshot_template(db, template, None)
            added = True
        if added:
            db.commit()
