from datetime import datetime

from sqlalchemy import or_
from sqlmodel import Session, select

from app.modules.usuarios.models import Rol, Usuario, UsuarioRol


def por_email(session: Session, email: str) -> Usuario | None:
    return session.exec(select(Usuario).where(Usuario.email == email)).first()


def por_id(session: Session, usuario_id: int, *, bloquear: bool = False) -> Usuario | None:
    consulta = select(Usuario).where(Usuario.id == usuario_id)
    if bloquear:
        consulta = consulta.with_for_update()
    return session.exec(consulta).first()


def listar(session: Session) -> list[Usuario]:
    return list(session.exec(select(Usuario).order_by(Usuario.id)).all())


def roles_vigentes(session: Session, ids: list[int], instante: datetime) -> dict[int, list[str]]:
    resultado = {usuario_id: [] for usuario_id in ids}
    if ids:
        consulta = (
            select(UsuarioRol.usuario_id, Rol.nombre)
            .join(Rol, Rol.id == UsuarioRol.rol_id)
            .where(UsuarioRol.usuario_id.in_(ids))
            .where(or_(UsuarioRol.expires_at == None, UsuarioRol.expires_at > instante))
            .order_by(Rol.nombre)
        )
        for usuario_id, nombre in session.exec(consulta):
            resultado[usuario_id].append(nombre)
    return resultado


def rol_por_nombre(session: Session, nombre: str) -> Rol | None:
    return session.exec(select(Rol).where(Rol.nombre == nombre)).first()
