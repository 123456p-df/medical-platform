from app.config import Settings
from app.db import Base, make_engine, make_session_factory
from app.models import Doctor, DoctorPatientAccess, Patient, User, utcnow
from app.security import encrypt_identity, hash_password, identity_hash

settings = Settings()
engine = make_engine(settings.database_url)
Base.metadata.create_all(engine)

with make_session_factory(engine)() as db:
    doctor = User(
        username="demo_doctor",
        password_hash=hash_password("123456"),
        role="doctor",
    )
    patient_user = User(
        username="demo_patient",
        password_hash=hash_password("123456"),
        role="patient",
    )
    db.add_all([doctor, patient_user])
    db.flush()
    db.add(Doctor(user_id=doctor.id))
    patient = Patient(
        user_id=patient_user.id,
        name="demo_patient",
        id_number_hash=identity_hash("E2E-REAL-IDENTITY", settings),
        id_number_encrypted=encrypt_identity("E2E-REAL-IDENTITY", settings),
        profile_completed_at=utcnow(),
        gender="unknown",
    )
    db.add(patient)
    db.flush()
    db.add(
        DoctorPatientAccess(
            doctor_id=doctor.id,
            patient_id=patient.id,
            status="active",
        )
    )
    db.commit()
