import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

FRONTEND_ORIGINS = tuple(
    origen.strip()
    for origen in os.getenv("FRONTEND_ORIGINS", "http://localhost:5173").split(",")
    if origen.strip()
)
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "true").lower() not in {"false", "0"}
TOKEN_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))


def secret_key() -> str:
    clave = os.getenv("SECRET_KEY", "")
    if len(clave.encode("utf-8")) < 32 or clave.startswith("REEMPLAZAR"):
        raise RuntimeError("Configurá SECRET_KEY con una clave aleatoria de al menos 32 bytes.")
    return clave
