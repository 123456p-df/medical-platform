import hashlib
import hmac
from datetime import UTC, datetime, timedelta
from uuid import uuid4

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError
from cryptography.fernet import Fernet

from app.config import Settings
from app.models import User, utcnow

password_hasher = PasswordHasher()
# Verify a fixed dummy hash for missing users to avoid a username timing oracle.
dummy_hash = password_hasher.hash("not-a-user-password")


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password: str, encoded: str) -> bool:
    try:
        return password_hasher.verify(encoded, password)
    except (VerificationError, InvalidHashError):
        return False


def create_token(user: User, settings: Settings) -> str:
    now = utcnow()
    return jwt.encode(
        {
            "sub": str(user.id),
            "jti": uuid4().hex,
            "iat": now,
            "nbf": now,
            "exp": now + timedelta(minutes=settings.access_token_minutes),
            "iss": settings.jwt_issuer,
            "aud": settings.jwt_audience,
        },
        settings.jwt_secret.get_secret_value(),
        algorithm="HS256",
    )


def decode_token(token: str, settings: Settings) -> tuple[int, str, datetime]:
    payload = jwt.decode(
        token,
        settings.jwt_secret.get_secret_value(),
        algorithms=["HS256"],
        issuer=settings.jwt_issuer,
        audience=settings.jwt_audience,
        options={"require": ["sub", "jti", "iat", "nbf", "exp", "iss", "aud"]},
    )
    user_id = int(payload["sub"])
    if not 1 <= user_id <= 2147483647:
        raise ValueError("Invalid user ID")
    jti = payload["jti"]
    if not isinstance(jti, str) or len(jti) > 64 or not jti:
        raise ValueError("Invalid token ID")
    return user_id, jti, datetime.fromtimestamp(payload["exp"], UTC)


def normalize_id(value: str) -> str:
    return value.strip().upper()


def identity_hash(value: str, settings: Settings) -> str:
    return hmac.new(
        settings.id_hash_key.get_secret_value().encode(),
        normalize_id(value).encode(),
        hashlib.sha256,
    ).hexdigest()


def encrypt_identity(value: str, settings: Settings) -> str:
    return (
        Fernet(settings.id_encryption_key.get_secret_value().encode())
        .encrypt(normalize_id(value).encode())
        .decode()
    )
