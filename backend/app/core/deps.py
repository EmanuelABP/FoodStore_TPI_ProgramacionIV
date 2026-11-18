from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, Request
from jose import JWTError
from sqlmodel import Session

from app.core.config import FRONTEND_ORIGINS
from app.core.database import get_session
from app.core.security import decode_access_token
from app.modules.usuarios.models import Role, Usuario
from app.modules.usuarios.repository import UsuarioRepository
from app.modules.usuarios.service import exigir_cuenta_activa

Sesion = Annotated[Session, Depends(get_session)]


def verificar_origen(request: Request) -> None:
    origen = request.headers.get("origin")
    permitidos = (*FRONTEND_ORIGINS, str(request.base_url).rstrip("/"))
    if request.method not in {"GET", "HEAD", "OPTIONS"} and origen is not None and origen not in permitidos:
        raise HTTPException(status_code=403, detail="Origen no permitido.")


def get_current_user(session: Sesion, access_token: Annotated[str | None, Cookie()] = None) -> Usuario:
    error = HTTPException(status_code=401, detail="Sesión inválida o vencida.", headers={"WWW-Authenticate": "Cookie"})
    if not access_token:
        raise error

    try:
        usuario_id = decode_access_token(access_token)
    except (JWTError, TypeError, ValueError) as exc:
        raise error from exc

    usuario = UsuarioRepository(session).get_by_id(usuario_id)
    if usuario is None:
        raise error
    return usuario


def get_current_active_user(
    usuario: Annotated[Usuario, Depends(get_current_user)],
    _origen: Annotated[None, Depends(verificar_origen)],
) -> Usuario:
    exigir_cuenta_activa(usuario)
    return usuario


UsuarioActivo = Annotated[Usuario, Depends(get_current_active_user)]


def require_role(roles: list[Role]):
    def verificar(usuario: UsuarioActivo) -> Usuario:
        if usuario.role not in roles:
            raise HTTPException(status_code=403, detail="No tenés permisos para esta operación.")
        return usuario

    return verificar


solo_admin = require_role(["admin"])
