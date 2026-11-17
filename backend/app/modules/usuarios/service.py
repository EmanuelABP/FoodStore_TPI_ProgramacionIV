import bcrypt
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session

from app.modules.usuarios import repository
from app.modules.usuarios.models import Usuario, UsuarioRol, ahora
from app.modules.usuarios.schemas import UserCreate, UserPublic

_HASH_FICTICIO = bcrypt.hashpw(b"verificacion-sin-usuario", bcrypt.gensalt())


def _id(usuario: Usuario) -> int:
    assert usuario.id is not None
    return usuario.id


def publico(session: Session, usuario: Usuario) -> UserPublic:
    roles = repository.roles_vigentes(session, [_id(usuario)], ahora())
    return _publico(usuario, roles[_id(usuario)])


def _publico(usuario: Usuario, roles: list[str]) -> UserPublic:
    return UserPublic(
        id=_id(usuario), nombre=usuario.nombre, apellido=usuario.apellido,
        email=usuario.email, celular=usuario.celular, deleted_at=usuario.deleted_at,
        roles=roles,
    )


def registrar(session: Session, datos: UserCreate, *, rol: str = "user") -> UserPublic:
    email = str(datos.email).lower()
    if repository.por_email(session, email) is not None:
        raise HTTPException(status_code=409, detail="El email ya está registrado.")
    fila_rol = repository.rol_por_nombre(session, rol)
    if fila_rol is None or fila_rol.id is None:
        raise HTTPException(status_code=503, detail="Ejecutá el seed de roles.")
    password_hash = bcrypt.hashpw(datos.password.get_secret_value().encode("utf-8"), bcrypt.gensalt())
    usuario = Usuario(
        nombre=datos.nombre, apellido=datos.apellido, email=email,
        celular=datos.celular or None, password_hash=password_hash.decode("ascii"),
    )
    try:
        session.add(usuario)
        session.flush()
        session.add(UsuarioRol(usuario_id=_id(usuario), rol_id=fila_rol.id))
        session.commit()
    except IntegrityError as error:
        session.rollback()
        if getattr(error.orig, "pgcode", None) == "23505":
            raise HTTPException(status_code=409, detail="El email ya está registrado.") from error
        raise
    return publico(session, usuario)


def autenticar(session: Session, email: str, password: str) -> Usuario:
    usuario = repository.por_email(session, email.strip().lower())
    password_bytes = password.encode("utf-8")
    hash_guardado = usuario.password_hash.encode("ascii") if usuario else _HASH_FICTICIO
    valida = len(password_bytes) <= 72 and bcrypt.checkpw(password_bytes, hash_guardado)
    if usuario is None or not valida:
        raise HTTPException(
            status_code=401, detail="Email o contraseña incorrectos.", headers={"WWW-Authenticate": "Cookie"},
        )
    exigir_cuenta_activa(usuario)
    return usuario


def exigir_cuenta_activa(usuario: Usuario) -> None:
    if usuario.deleted_at is not None:
        raise HTTPException(status_code=400, detail="Cuenta de usuario desactivada")


def listar(session: Session) -> list[UserPublic]:
    usuarios = repository.listar(session)
    roles = repository.roles_vigentes(session, [_id(usuario) for usuario in usuarios], ahora())
    return [_publico(usuario, roles[_id(usuario)]) for usuario in usuarios]


def cambiar_estado(session: Session, usuario_id: int, *, activo: bool) -> UserPublic:
    usuario = repository.por_id(session, usuario_id, bloquear=True)
    if usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    usuario.updated_at = ahora()
    usuario.deleted_at = None if activo else usuario.updated_at
    session.commit()
    return publico(session, usuario)
