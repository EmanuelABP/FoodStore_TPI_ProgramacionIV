from datetime import datetime, timezone

from fastapi import HTTPException
from sqlmodel import Session, select

from app.core.catalogo import confirmar_nombre
from app.ingrediente.model import Ingrediente
from app.ingrediente.schema import IngredienteDatos


def listar(session: Session) -> list[Ingrediente]:
    consulta = select(Ingrediente).where(Ingrediente.deleted_at == None).order_by(Ingrediente.id)
    return list(session.exec(consulta).all())


def obtener(session: Session, ingrediente_id: int) -> Ingrediente:
    consulta = (
        select(Ingrediente)
        .where(Ingrediente.id == ingrediente_id, Ingrediente.deleted_at == None)
        .with_for_update()
    )
    ingrediente = session.exec(consulta).first()
    if ingrediente is None:
        raise HTTPException(status_code=404, detail="Ingrediente no encontrado.")
    return ingrediente


def crear(session: Session, datos: IngredienteDatos) -> Ingrediente:
    ingrediente = Ingrediente(nombre=datos.nombre)
    session.add(ingrediente)
    confirmar_nombre(session, "ingredientes", "un ingrediente")
    session.refresh(ingrediente)
    return ingrediente


def actualizar(session: Session, ingrediente_id: int, datos: IngredienteDatos) -> Ingrediente:
    ingrediente = obtener(session, ingrediente_id)
    ingrediente.nombre = datos.nombre
    confirmar_nombre(session, "ingredientes", "un ingrediente")
    session.refresh(ingrediente)
    return ingrediente


def eliminar(session: Session, ingrediente_id: int) -> None:
    ingrediente = obtener(session, ingrediente_id)
    ingrediente.deleted_at = datetime.now(timezone.utc)
    session.commit()
