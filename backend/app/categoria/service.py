from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import func
from sqlmodel import Session, select

from app.categoria.model import Categoria
from app.categoria.schema import CategoriaCreate, CategoriaPaginatedResponse, CategoriaRead, CategoriaUpdate
from app.core.catalogo import confirmar_nombre
from app.producto.model import Producto, ProductoCategoria


def listar_categorias(
    session: Session, *, offset: int | None = None, limit: int | None = None,
    nombre: str | None = None, incluir_inactivos: bool = False,
) -> list[Categoria] | CategoriaPaginatedResponse:
    consulta = select(Categoria)
    if not incluir_inactivos:
        consulta = consulta.where(Categoria.deleted_at == None)
    if nombre is not None:
        consulta = consulta.where(func.lower(Categoria.nombre).contains(nombre.strip().lower(), autoescape=True))
    ordenada = consulta.order_by(Categoria.id)
    if offset is None and limit is None and nombre is None and not incluir_inactivos:
        return list(session.exec(ordenada).all())
    total = session.exec(select(func.count()).select_from(consulta.subquery())).one()
    categorias = session.exec(ordenada.offset(offset or 0).limit(limit or 10)).all()
    return CategoriaPaginatedResponse(total=total, items=[CategoriaRead.model_validate(c) for c in categorias])


def obtener_categoria(session: Session, categoria_id: int, *, bloquear: bool = False) -> Categoria:
    consulta = select(Categoria).where(Categoria.id == categoria_id, Categoria.deleted_at == None)
    if bloquear:
        consulta = consulta.with_for_update()
    categoria = session.exec(consulta).first()
    if categoria is None:
        raise HTTPException(status_code=404, detail="Categoría no encontrada.")
    return categoria


def crear_categoria(session: Session, datos: CategoriaCreate) -> Categoria:
    categoria = Categoria.model_validate(datos)
    session.add(categoria)
    confirmar_nombre(session, "categorias", "una categoría")
    session.refresh(categoria)
    return categoria


def actualizar_categoria(session: Session, categoria_id: int, datos: CategoriaUpdate) -> Categoria:
    categoria = obtener_categoria(session, categoria_id, bloquear=True)
    categoria.sqlmodel_update(datos.model_dump())
    confirmar_nombre(session, "categorias", "una categoría")
    session.refresh(categoria)
    return categoria


def eliminar_categoria(session: Session, categoria_id: int) -> None:
    categoria = obtener_categoria(session, categoria_id, bloquear=True)
    vinculo = (
        select(ProductoCategoria)
        .join(Producto, Producto.id == ProductoCategoria.producto_id)
        .where(ProductoCategoria.categoria_id == categoria_id, Producto.deleted_at == None)
        .limit(1)
    )
    if session.exec(vinculo).first() is not None:
        raise HTTPException(status_code=409, detail="Quitá primero las asociaciones con productos activos.")
    categoria.deleted_at = datetime.now(timezone.utc)
    session.commit()
