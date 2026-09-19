from uuid import uuid4

from fastapi import APIRouter, Query
from sqlalchemy import select

from app.deps import DB, CurrentUser, require_admin, require_doctor
from app.errors import APIError, Envelope, success
from app.models import ReportTemplate, ReportTemplateVersion, utcnow
from app.report_templates import normalize_template_fields, snapshot_template, template_out, version_out
from app.audit import audit
from app.schemas import (
    ReportTemplateCreate,
    ReportTemplateOut,
    ReportTemplatePatch,
    ReportTemplateVersionOut,
)

router = APIRouter(tags=["Report Templates"])


@router.get("/report-templates", response_model=Envelope[list[ReportTemplateOut]])
def list_report_templates(
    db: DB,
    user: CurrentUser,
    modality: str | None = Query(None, max_length=16),
    organ_id: str | None = Query(None, max_length=64),
    active_only: bool = Query(True),
):
    require_doctor(db, user)
    query = select(ReportTemplate)
    if active_only:
        query = query.where(ReportTemplate.is_active.is_(True))
    if modality:
        query = query.where(ReportTemplate.modality == modality)
    if organ_id:
        query = query.where(ReportTemplate.organ_id == organ_id)
    rows = db.scalars(query.order_by(ReportTemplate.modality, ReportTemplate.name, ReportTemplate.id))
    return success([template_out(row) for row in rows])


@router.get("/report-templates/{template_id}", response_model=Envelope[ReportTemplateOut])
def get_report_template(template_id: str, db: DB, user: CurrentUser):
    require_doctor(db, user)
    template = db.get(ReportTemplate, template_id)
    if template is None:
        raise APIError(404, 40410, "Report template not found")
    return success(template_out(template))


@router.post("/report-templates", status_code=201, response_model=Envelope[ReportTemplateOut])
def create_report_template(body: ReportTemplateCreate, db: DB, user: CurrentUser):
    require_admin(user)
    fields = normalize_template_fields([item.model_dump() for item in body.fields])
    template = ReportTemplate(
        id=f"template_{uuid4().hex}",
        name=body.name,
        modality=body.modality,
        organ_id=body.organ_id,
        created_by_user_id=user.id,
        fields=fields,
        updated_at=utcnow(),
    )
    db.add(template)
    db.flush()
    snapshot_template(db, template, user.id)
    audit(db, user.id, None, "report_template.create", "report_template", template.id)
    db.commit()
    return success(template_out(template))


@router.patch("/report-templates/{template_id}", response_model=Envelope[ReportTemplateOut])
def update_report_template(template_id: str, body: ReportTemplatePatch, db: DB, user: CurrentUser):
    require_admin(user)
    template = db.get(ReportTemplate, template_id)
    if template is None:
        raise APIError(404, 40410, "Report template not found")
    values = body.model_dump(exclude_unset=True)
    if not values:
        raise APIError(422, 42204, "Provide at least one template field")
    if "fields" in values:
        values["fields"] = normalize_template_fields([item.model_dump() for item in body.fields])
    if values.get("is_default"):
        siblings = db.scalars(
            select(ReportTemplate).where(
                ReportTemplate.id != template.id,
                ReportTemplate.is_default.is_(True),
                ReportTemplate.modality == template.modality,
                ReportTemplate.organ_id == template.organ_id,
            )
        )
        for sibling in siblings:
            sibling.is_default = False
    for key, value in values.items():
        setattr(template, key, value)
    template.version += 1
    template.updated_at = utcnow()
    snapshot_template(db, template, user.id)
    audit(db, user.id, None, "report_template.update", "report_template", template.id)
    db.commit()
    return success(template_out(template))


@router.get(
    "/report-templates/{template_id}/versions",
    response_model=Envelope[list[ReportTemplateVersionOut]],
)
def list_template_versions(template_id: str, db: DB, user: CurrentUser):
    require_doctor(db, user)
    if db.get(ReportTemplate, template_id) is None:
        raise APIError(404, 40410, "Report template not found")
    rows = db.scalars(
        select(ReportTemplateVersion)
        .where(ReportTemplateVersion.template_id == template_id)
        .order_by(ReportTemplateVersion.version.desc())
    )
    return success([version_out(row) for row in rows])


@router.post(
    "/report-templates/{template_id}/versions/{version}/restore",
    response_model=Envelope[ReportTemplateOut],
)
def restore_template_version(template_id: str, version: int, db: DB, user: CurrentUser):
    require_admin(user)
    template = db.get(ReportTemplate, template_id)
    snapshot = db.scalar(
        select(ReportTemplateVersion).where(
            ReportTemplateVersion.template_id == template_id,
            ReportTemplateVersion.version == version,
        )
    )
    if template is None or snapshot is None:
        raise APIError(404, 40410, "Report template version not found")
    template.name = snapshot.name
    template.modality = snapshot.modality
    template.organ_id = snapshot.organ_id
    template.fields = snapshot.fields
    template.is_active = snapshot.is_active
    template.is_default = snapshot.is_default
    template.version += 1
    template.updated_at = utcnow()
    snapshot_template(db, template, user.id)
    audit(
        db,
        user.id,
        None,
        "report_template.restore",
        "report_template",
        template.id,
        after={"restored_version": version},
    )
    db.commit()
    return success(template_out(template))
