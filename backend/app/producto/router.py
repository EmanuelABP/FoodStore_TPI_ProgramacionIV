from fastapi import APIRouter, Depends, Query, Response, status
from sqlmodel import Session

from app.core.database import get_session
from app.core.security import get_current_active_user, solo_admin
from app.producto.schema import (
    CategoriaProductoRead,
    ProductoCategoriaCreate,
    ProductoCategoriaRead,
    ProductoCreate,
    ProductoUpdate,
    ProductoRead,
    ProductoPaginatedResponse,
)
from app.producto import service


router = APIRouter(
    prefix="/productos",
    dependencies=[Depends(get_current_active_user)],
    tags=["Productos"],
)


@router.get("/", response_model=list[ProductoRead] | ProductoPaginatedResponse)
def listar_productos(
    session: Session = Depends(get_session),
    offset: int | None = Query(default=None, ge=0),
    limit: int | None = Query(default=None, ge=1, le=100),
    nombre: str | None = None,
):
    return service.listar_productos(session, offset=offset, limit=limit, nombre=nombre)


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(
    producto_id: int,
    session: Session = Depends(get_session),
):
    return service.obtener_producto(session, producto_id)


@router.post(
    "/",
    response_model=ProductoRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(solo_admin)],
)
def crear_producto(
    datos: ProductoCreate,
    session: Session = Depends(get_session),
):
    return service.crear_producto(session, datos)


@router.put("/{producto_id}", response_model=ProductoRead, dependencies=[Depends(solo_admin)])
def actualizar_producto(
    producto_id: int,
    datos: ProductoUpdate,
    session: Session = Depends(get_session),
):
    return service.actualizar_producto(session, producto_id, datos)


@router.delete(
    "/{producto_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(solo_admin)],
)
def eliminar_producto(
    producto_id: int,
    session: Session = Depends(get_session),
):
    service.eliminar_producto(session, producto_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{producto_id}/categorias", response_model=ProductoCategoriaRead, status_code=201, dependencies=[Depends(solo_admin)])
def asociar_categoria(
    producto_id: int,
    datos: ProductoCategoriaCreate,
    session: Session = Depends(get_session),
):
    return service.crear_relacion(session, producto_id, datos)


@router.get("/{producto_id}/categorias", response_model=list[CategoriaProductoRead])
def listar_categorias_producto(producto_id: int, session: Session = Depends(get_session)):
    return service.listar_categorias_producto(session, producto_id)


@router.delete("/{producto_id}/categorias/{categoria_id}", status_code=204, dependencies=[Depends(solo_admin)])
def quitar_categoria(
    producto_id: int,
    categoria_id: int,
    session: Session = Depends(get_session),
):
    service.eliminar_relacion(session, producto_id, categoria_id)
    return Response(status_code=204)
