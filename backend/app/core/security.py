from datetime import datetime, timedelta, timezone

from jose import jwt
from passlib.context import CryptContext

from app.core.config import secret_key, settings

password_context = CryptContext(schemes=["bcrypt"])


def hash_password(password: str) -> str:
    return password_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    if len(password.encode("utf-8")) > 72 or "\0" in password:
        return False
    return password_context.verify(password, hashed_password)


def create_access_token(usuario_id: int) -> str:
    now = datetime.now(timezone.utc)
    expiration = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub": str(usuario_id), "iat": now, "exp": expiration},
        secret_key(),
        algorithm=settings.ALGORITHM,
    )


def decode_access_token(token: str) -> int:
    claims = jwt.decode(
        token,
        secret_key(),
        algorithms=[settings.ALGORITHM],
        options={"require_sub": True, "require_exp": True},
    )
    usuario_id = int(claims["sub"])
    if not 0 < usuario_id <= 2147483647:
        raise ValueError("ID de usuario inválido.")
    return usuario_id
