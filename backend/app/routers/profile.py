import base64
import io
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, UploadFile
from fastapi.responses import FileResponse
from PIL import Image, ImageOps, UnidentifiedImageError
from sqlalchemy import func, select

from app.audit import audit
from app.deps import DB, Config, CurrentUser
from app.errors import APIError, Envelope, success
from app.models import ProfileFile
from app.schemas import ProfilePatch
from app.services.storage import profile_relative_path, stored_path

router = APIRouter(prefix="/auth/profile", tags=["Personal profile"])
MAX_FILE = 10 * 1024 * 1024


def file_out(row):
    return {
        "id": row.id,
        "name": row.name,
        "size_bytes": row.size_bytes,
        "media_type": row.media_type,
        "created_at": row.created_at,
    }


@router.get("", response_model=Envelope[dict])
def get_profile(db: DB, user: CurrentUser):
    return success(
        {
            "user_id": user.id,
            "username": user.username,
            "role": user.role,
            "display_name": user.username,
            **user.profile,
            "files": [
                file_out(r)
                for r in db.scalars(
                    select(ProfileFile)
                    .where(ProfileFile.user_id == user.id)
                    .order_by(ProfileFile.created_at.desc())
                )
            ],
        }
    )


@router.patch("", response_model=Envelope[dict])
def update_profile(body: ProfilePatch, db: DB, user: CurrentUser):
    user.profile = {**user.profile, **body.model_dump()}
    audit(db, user.id, None, "profile.update", "user", user.id)
    db.commit()
    return get_profile(db, user)


def read_upload(file, limit):
    try:
        data = file.file.read(limit + 1)
    finally:
        file.file.close()
    if len(data) > limit:
        raise APIError(413, 41301, "File exceeds upload limit")
    if not data:
        raise APIError(400, 40010, "File is empty")
    return data


def decode_image(data):
    try:
        image = Image.open(io.BytesIO(data))
        if image.format not in {"JPEG", "PNG", "WEBP"} or image.width * image.height > 16000000:
            raise ValueError()
        image.load()
        return ImageOps.exif_transpose(image).convert("RGB")
    except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError):
        raise APIError(
            400, 40010, "Use a valid JPEG, PNG or WebP image (up to 16 megapixels)"
        ) from None


@router.post("/avatar", response_model=Envelope[dict])
def upload_avatar(db: DB, user: CurrentUser, file: UploadFile = File()):
    image = decode_image(read_upload(file, 5 * 1024 * 1024))
    image = ImageOps.fit(image, (256, 256))
    output = io.BytesIO()
    image.save(output, "JPEG", quality=88)
    user.profile = {
        **user.profile,
        "avatar_url": "data:image/jpeg;base64," + base64.b64encode(output.getvalue()).decode(),
    }
    audit(db, user.id, None, "profile.avatar", "user", user.id)
    db.commit()
    return get_profile(db, user)


@router.delete("/avatar", response_model=Envelope[dict])
def remove_avatar(db: DB, user: CurrentUser):
    user.profile = {k: v for k, v in user.profile.items() if k != "avatar_url"}
    db.commit()
    return get_profile(db, user)


@router.post("/files", status_code=201, response_model=Envelope[dict])
def upload_file(db: DB, user: CurrentUser, settings: Config, file: UploadFile = File()):
    # Serialize uploads for a user so the quota also holds for concurrent requests.
    db.refresh(user, with_for_update=True)
    count = db.scalar(
        select(func.count()).select_from(ProfileFile).where(ProfileFile.user_id == user.id)
    )
    if count >= 20:
        raise APIError(409, 40905, "At most 20 profile files are allowed")
    data = read_upload(file, MAX_FILE)
    name = Path((file.filename or "document").replace("\\", "/")).name[:200]
    name = "".join(c for c in name if c.isprintable()) or "document"
    if data.startswith(b"%PDF-") and name.lower().endswith(".pdf"):
        media = "application/pdf"
    else:
        image = decode_image(data)
        output = io.BytesIO()
        image.save(output, "JPEG", quality=92)
        data = output.getvalue()
        name = Path(name).stem[:190] + ".jpg"
        media = "image/jpeg"
    identifier = "file_" + uuid4().hex
    relative = profile_relative_path(user.id, identifier)
    path = stored_path(settings, relative)
    path.parent.mkdir(parents=True, exist_ok=True)
    row = ProfileFile(
        id=identifier,
        user_id=user.id,
        name=name,
        media_type=media,
        size_bytes=len(data),
        file_path=relative,
    )
    try:
        path.write_bytes(data)
        db.add(row)
        audit(db, user.id, None, "profile.file.upload", "profile_file", identifier)
        db.commit()
    except Exception:
        db.rollback()
        path.unlink(missing_ok=True)
        raise
    return success(file_out(row))


def own_file(db, user, file_id):
    row = db.get(ProfileFile, file_id)
    if row is None or row.user_id != user.id:
        raise APIError(404, 40410, "Profile file not found")
    return row


@router.get("/files/{file_id}")
def download_file(file_id: str, db: DB, user: CurrentUser, settings: Config):
    row = own_file(db, user, file_id)
    path = stored_path(settings, row.file_path)
    if not path.is_file():
        raise APIError(404, 40410, "Profile file not found")
    return FileResponse(path, media_type=row.media_type, filename=row.name)


@router.delete("/files/{file_id}", response_model=Envelope[None])
def delete_file(file_id: str, db: DB, user: CurrentUser, settings: Config):
    row = own_file(db, user, file_id)
    path = stored_path(settings, row.file_path)
    db.delete(row)
    audit(db, user.id, None, "profile.file.delete", "profile_file", file_id)
    db.commit()
    path.unlink(missing_ok=True)
    return success(None)
