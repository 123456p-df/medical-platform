from datetime import date

from app.db import Base, make_engine, make_session_factory
from app.errors import APIError
from app.models import (
    AnalysisTask,
    Doctor,
    DoctorPatientAccess,
    Finding,
    MedicalImage,
    MedicalRecord,
    Patient,
    User,
)
from app.routers.analysis import update_finding
from app.routers.records import (
    add_addendum,
    create_record,
    list_addenda,
    update_record,
)
from app.schemas import AddendumCreate, FindingPatch, RecordCreate, RecordPatch

engine = make_engine("sqlite+pysqlite:///:memory:")
Base.metadata.create_all(engine)
session = make_session_factory(engine)()

doctor_user = User(username="p0-doctor", password_hash="not-used", role="doctor")
patient = Patient(name="P0 Patient")
session.add_all([doctor_user, patient])
session.flush()
doctor = Doctor(user_id=doctor_user.id)
session.add(doctor)
session.flush()
session.add(DoctorPatientAccess(doctor_id=doctor.id, patient_id=patient.id, status="active"))
session.commit()

draft = RecordCreate(
    organ_id="lung",
    organ_ids=["lung"],
    diagnosis="Draft diagnosis",
    description="Draft description",
    record_date=date.today(),
)
assert draft.reviewed is False
create_record(patient.id, draft, session, doctor_user)
record = session.query(MedicalRecord).one()
assert record.reviewed is False
assert record.signed_at is None

update_record(record.id, RecordPatch(reviewed=True), session, doctor_user)
assert record.reviewed is True
assert record.signed_at is not None
try:
    update_record(record.id, RecordPatch(description="overwrite"), session, doctor_user)
except APIError as error:
    assert error.status == 409
    assert error.code == 40906
else:
    raise AssertionError("A signed report was overwritten")

add_addendum(
    record.id,
    AddendumCreate(reason="Correct wording", content="The original report remains unchanged."),
    session,
    doctor_user,
)
addenda = list_addenda(record.id, session, doctor_user)["data"]
assert len(addenda) == 1
assert addenda[0]["author_name"] == "p0-doctor"

geometry = FindingPatch(
    diameter_mm=8.2,
    center_world_mm=[10, 20, 30],
    box_world_mm=[10, 20, 30, 8, 9, 10],
    center_voxel=[1, 2, 3],
    box_voxel=[1, 2, 3, 4, 5, 6],
    modification_reason="Manual MPR adjustment",
    expected_revision=1,
)
assert geometry.status is None
assert geometry.expected_revision == 1

image = MedicalImage(
    id="p0-image",
    patient_id=patient.id,
    organ_id="lung",
    image_type="CT",
    file_path="unused.nii",
    shape=[4, 4, 4],
    spacing=[1, 1, 1],
    size_bytes=128,
)
task = AnalysisTask(
    id="p0-task",
    image_id=image.id,
    patient_id=patient.id,
    requested_by=doctor_user.id,
    model_name="p0-model",
    status="completed",
    progress=100,
)
finding = Finding(
    id="p0-finding",
    task_id=task.id,
    image_id=image.id,
    patient_id=patient.id,
    label="Candidate",
    description="Original model output",
    confidence=0.8,
    diameter_mm=4,
    center_world_mm=[0, 0, 0],
    box_world_mm=[0, 0, 0, 4, 4, 4],
    center_voxel=[0, 0, 0],
    box_voxel=[0, 0, 0, 4, 4, 4],
)
session.add(image)
session.commit()
session.add(task)
session.commit()
session.add(finding)
session.commit()
update_finding(finding.id, geometry, session, doctor_user)
assert finding.revision == 2
assert finding.center_world_mm == [10.0, 20.0, 30.0]
try:
    update_finding(
        finding.id,
        FindingPatch(status="confirmed", expected_revision=1),
        session,
        doctor_user,
    )
except APIError as error:
    assert error.status == 409
    assert error.code == 40908
else:
    raise AssertionError("A stale finding revision was accepted")

print("P0 backend contracts passed")
