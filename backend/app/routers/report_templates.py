from uuid import uuid4

from fastapi import APIRouter, Query
from sqlalchemy import select

from app.deps import DB, CurrentUser, require_admin, require_doctor
from app.errors import APIError, Envelope, success
from app.models import ReportTemplate, utcnow
from app.report_templates import normalize_template_fields, template_out
from app.schemas import ReportTemplateCreate, ReportTemplateOut, ReportTemplatePatch

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
    for key, value in values.items():
        setattr(template, key, value)
    template.version += 1
    template.updated_at = utcnow()
    db.commit()
    return success(template_out(template))
