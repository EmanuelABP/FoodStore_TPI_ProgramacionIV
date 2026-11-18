from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session

from app.core.security import hash_password, verify_password
from app.modules.auth.schemas import UserCreate
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.repository import UsuarioRepository
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import exigir_cuenta_activa
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

_HASH_FICTICIO = hash_password("verificacion-sin-usuario")
_DUPLICADOS = {
    "uq_usuarios_username": "El username ya está registrado.",
    "uq_usuarios_email": "El email ya está registrado.",
}


def registrar(datos: UserCreate) -> UserPublic:
    usuario = Usuario(
        username=datos.username,
        full_name=datos.full_name,
        email=datos.email.lower(),
        hashed_password=hash_password(datos.password.get_secret_value()),
        role="user",
    )
    try:
        with UsuarioUnitOfWork() as uow:
            uow.usuarios.add(usuario)
            uow.session.flush()
            return UserPublic.model_validate(usuario)
    except IntegrityError as exc:
        constraint = getattr(getattr(exc.orig, "diag", None), "constraint_name", None)
        if constraint in _DUPLICADOS:
            raise HTTPException(status_code=409, detail=_DUPLICADOS[constraint]) from exc
        raise


def autenticar(session: Session, username: str, password: str) -> Usuario:
    usuario = None if "\0" in username else UsuarioRepository(session).get_by_username(username.strip())
    hash_guardado = usuario.hashed_password if usuario is not None else _HASH_FICTICIO
    if not verify_password(password, hash_guardado) or usuario is None:
        raise HTTPException(
            status_code=401,
            detail="Usuario o contraseña incorrectos.",
            headers={"WWW-Authenticate": "Cookie"},
        )

    exigir_cuenta_activa(usuario)
    return usuario
