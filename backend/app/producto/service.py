from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import delete, func, update
from sqlmodel import Session, select

from app.categoria.model import Categoria
from app.core.catalogo import confirmar_nombre
from app.ingrediente.model import Ingrediente
from app.producto.model import Producto, ProductoCategoria, ProductoIngrediente
from app.producto.schema import (
    CategoriaProductoRead, ProductoCategoriaCreate, ProductoCreate, ProductoPaginatedResponse, ProductoRead, ProductoUpdate,
)


def _respuestas(session: Session, productos: list[Producto]) -> list[ProductoRead]:
    ids = [producto.id for producto in productos]
    ingredientes: dict[int, list[int]] = {}
    categorias: dict[int, list[CategoriaProductoRead]] = {}
    if ids:
        for producto_id, categoria in _categorias(session, ids):
            categorias.setdefault(producto_id, []).append(categoria)
        consulta = (
            select(ProductoIngrediente)
            .where(ProductoIngrediente.producto_id.in_(ids))
            .order_by(ProductoIngrediente.ingrediente_id)
        )
        for vinculo in session.exec(consulta):
            ingredientes.setdefault(vinculo.producto_id, []).append(vinculo.ingrediente_id)
    return [
        ProductoRead.model_validate(
            producto.model_dump(), update={
                "ingrediente_ids": ingredientes.get(producto.id, []),
                "categorias": categorias.get(producto.id, []),
            },
        )
        for producto in productos
    ]


def listar_productos(
    session: Session, *, offset: int | None = None, limit: int | None = None,
    nombre: str | None = None,
) -> list[ProductoRead] | ProductoPaginatedResponse:
    consulta = select(Producto).where(Producto.deleted_at == None)
    if nombre is not None:
        consulta = consulta.where(func.lower(Producto.nombre).contains(nombre.strip().lower(), autoescape=True))
    ordenada = consulta.order_by(Producto.id)
    if offset is None and limit is None and nombre is None:
        return _respuestas(session, list(session.exec(ordenada).all()))
    total = session.exec(select(func.count()).select_from(consulta.subquery())).one()
    productos = list(session.exec(ordenada.offset(offset or 0).limit(limit or 10)).all())
    return ProductoPaginatedResponse(total=total, items=_respuestas(session, productos))


def _obtener(session: Session, producto_id: int, *, bloquear: bool = False) -> Producto:
    consulta = select(Producto).where(Producto.id == producto_id, Producto.deleted_at == None)
    if bloquear:
        consulta = consulta.with_for_update()
    producto = session.exec(consulta).first()
    if producto is None:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


def obtener_producto(session: Session, producto_id: int) -> ProductoRead:
    return _respuestas(session, [_obtener(session, producto_id)])[0]


def _validar_ingredientes(session: Session, ids: set[int]) -> None:
    if not ids:
        return
    consulta = (
        select(Ingrediente)
        .where(Ingrediente.id.in_(ids), Ingrediente.deleted_at == None)
        .order_by(Ingrediente.id)
        .with_for_update(read=True)
    )
    activos = {ingrediente.id for ingrediente in session.exec(consulta)}
    if faltantes := ids - activos:
        raise HTTPException(status_code=404, detail=f"Ingrediente {min(faltantes)} no encontrado o dado de baja.")


def _agregar_ingredientes(session: Session, producto_id: int, ids: set[int]) -> None:
    for ingrediente_id in sorted(ids):
        session.add(ProductoIngrediente(producto_id=producto_id, ingrediente_id=ingrediente_id))


def crear_producto(session: Session, datos: ProductoCreate) -> ProductoRead:
    ids = set(datos.ingrediente_ids)
    _validar_ingredientes(session, ids)
    producto = Producto.model_validate(datos.model_dump(exclude={"ingrediente_ids"}))
    session.add(producto)
    # La PK se necesita antes de agregar los vínculos. El índice también puede fallar en flush.
    confirmar_nombre_producto(session, producto, ids)
    return _respuestas(session, [producto])[0]


def confirmar_nombre_producto(session: Session, producto: Producto, ids: set[int]) -> None:
    from sqlalchemy.exc import IntegrityError

    try:
        session.flush()
    except IntegrityError as error:
        session.rollback()
        if getattr(getattr(error.orig, "diag", None), "constraint_name", None) == "uq_productos_nombre_activo":
            raise HTTPException(status_code=409, detail="Ya existe un producto con ese nombre.") from error
        raise
    assert producto.id is not None
    _agregar_ingredientes(session, producto.id, ids)
    confirmar_nombre(session, "productos", "un producto")
    session.refresh(producto)


def actualizar_producto(session: Session, producto_id: int, datos: ProductoUpdate) -> ProductoRead:
    producto = _obtener(session, producto_id, bloquear=True)
    if "ingrediente_ids" in datos.model_fields_set:
        actuales = set(_respuestas(session, [producto])[0].ingrediente_ids)
        nuevos = set(datos.ingrediente_ids)
        _validar_ingredientes(session, nuevos - actuales)
        quitar = actuales - nuevos
        if quitar:
            session.exec(delete(ProductoIngrediente).where(
                ProductoIngrediente.producto_id == producto_id,
                ProductoIngrediente.ingrediente_id.in_(quitar),
            ))
        _agregar_ingredientes(session, producto_id, nuevos - actuales)
    producto.sqlmodel_update(datos.model_dump(exclude={"ingrediente_ids"}))
    confirmar_nombre(session, "productos", "un producto")
    session.refresh(producto)
    return _respuestas(session, [producto])[0]


def eliminar_producto(session: Session, producto_id: int) -> None:
    producto = _obtener(session, producto_id, bloquear=True)
    producto.deleted_at = datetime.now(timezone.utc)
    session.commit()


def _categorias(session: Session, ids: list[int | None]) -> list[tuple[int, CategoriaProductoRead]]:
    consulta = (
        select(ProductoCategoria.producto_id, Categoria, ProductoCategoria.es_principal)
        .join(ProductoCategoria, ProductoCategoria.categoria_id == Categoria.id)
        .where(ProductoCategoria.producto_id.in_(ids), Categoria.deleted_at == None)
        .order_by(Categoria.id)
    )
    return [
        (id_producto, CategoriaProductoRead.model_validate(categoria.model_dump(), update={"es_principal": principal}))
        for id_producto, categoria, principal in session.exec(consulta)
    ]


def listar_categorias_producto(session: Session, producto_id: int) -> list[CategoriaProductoRead]:
    _obtener(session, producto_id)
    return [categoria for _, categoria in _categorias(session, [producto_id])]


def crear_relacion(
    session: Session, producto_id: int, datos: ProductoCategoriaCreate,
) -> ProductoCategoria:
    _obtener(session, producto_id, bloquear=True)
    categoria = session.exec(
        select(Categoria).where(Categoria.id == datos.categoria_id, Categoria.deleted_at == None).with_for_update()
    ).first()
    if categoria is None:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    clave = (producto_id, datos.categoria_id)
    if session.get(ProductoCategoria, clave) is not None:
        raise HTTPException(status_code=409, detail="El producto ya está asociado a esa categoría")
    if datos.es_principal:
        session.exec(update(ProductoCategoria).where(
            ProductoCategoria.producto_id == producto_id, ProductoCategoria.es_principal == True,
        ).values(es_principal=False))
    relacion = ProductoCategoria(
        producto_id=producto_id, categoria_id=datos.categoria_id, es_principal=datos.es_principal,
    )
    session.add(relacion)
    session.commit()
    session.refresh(relacion)
    return relacion


def eliminar_relacion(session: Session, producto_id: int, categoria_id: int) -> None:
    _obtener(session, producto_id, bloquear=True)
    relacion = session.get(ProductoCategoria, (producto_id, categoria_id))
    if relacion is None:
        raise HTTPException(status_code=404, detail="Relación no encontrada")
    session.delete(relacion)
    session.commit()
