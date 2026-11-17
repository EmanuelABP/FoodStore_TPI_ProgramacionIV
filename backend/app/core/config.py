from pathlib import Path

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[2] / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )

    DATABASE_URL: str = Field(default="", repr=False)
    SECRET_KEY: SecretStr = SecretStr("")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    # Opciones heredadas del TP9.
    FRONTEND_ORIGINS: str | None = None
    COOKIE_SECURE: str = "true"


settings = Settings()

# Si está configurada, la lista heredada conserva prioridad.
_origenes = settings.FRONTEND_ORIGINS
if _origenes is None:
    _origenes = settings.FRONTEND_ORIGIN

FRONTEND_ORIGINS = tuple(
    origen.strip() for origen in _origenes.split(",") if origen.strip()
)
COOKIE_SECURE = settings.COOKIE_SECURE.lower() not in {"false", "0"}
TOKEN_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES


def secret_key() -> str:
    clave = settings.SECRET_KEY.get_secret_value()
    if len(clave.encode("utf-8")) < 32 or clave.startswith("REEMPLAZAR"):
        raise RuntimeError("Configurá SECRET_KEY con una clave aleatoria de al menos 32 bytes.")
    return clave
