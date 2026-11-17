from datetime import timedelta
from typing import Annotated

import jwt
from fastapi import Cookie, Depends, HTTPException, Request
from sqlmodel import Session

from app.core.config import FRONTEND_ORIGINS, TOKEN_MINUTES, secret_key
from app.core.database import get_session
from app.modules.usuarios import repository, service
from app.modules.usuarios.models import Usuario, ahora

Sesion = Annotated[Session, Depends(get_session)]


def crear_token(usuario_id: int) -> str:
    instante = ahora()
    return jwt.encode(
        {"sub": str(usuario_id), "iat": instante, "exp": instante + timedelta(minutes=TOKEN_MINUTES)},
        secret_key(),
        algorithm="HS256",
    )


def verificar_origen(request: Request) -> None:
    origen = request.headers.get("origin")
    if request.method not in {"GET", "HEAD", "OPTIONS"} and origen is not None and origen not in (*FRONTEND_ORIGINS, str(request.base_url).rstrip("/")):
        raise HTTPException(status_code=403, detail="Origen no permitido.")


def get_current_user(
    session: Sesion, access_token: Annotated[str | None, Cookie()] = None,
) -> Usuario:
    error = HTTPException(
        status_code=401, detail="Sesión inválida o vencida.", headers={"WWW-Authenticate": "Cookie"},
    )
    if not access_token:
        raise error
    try:
        claims = jwt.decode(access_token, secret_key(), algorithms=["HS256"], options={"require": ["exp", "sub"]})
        usuario_id = int(claims["sub"])
        if not 0 < usuario_id <= 2147483647:
            raise ValueError()
    except (jwt.InvalidTokenError, ValueError, TypeError) as exc:
        raise error from exc
    usuario = repository.por_id(session, usuario_id)
    if usuario is None:
        raise error
    return usuario


def get_current_active_user(
    usuario: Annotated[Usuario, Depends(get_current_user)],
    _origen: Annotated[None, Depends(verificar_origen)],
) -> Usuario:
    service.exigir_cuenta_activa(usuario)
    return usuario


UsuarioActivo = Annotated[Usuario, Depends(get_current_active_user)]


def require_role(roles: list[str]):
    def verificar(usuario: UsuarioActivo, session: Sesion) -> Usuario:
        assert usuario.id is not None
        vigentes = repository.roles_vigentes(session, [usuario.id], ahora())[usuario.id]
        if not set(roles).intersection(vigentes):
            raise HTTPException(status_code=403, detail="No tenés permisos para esta operación.")
        return usuario

    return verificar


solo_admin = require_role(["admin"])
