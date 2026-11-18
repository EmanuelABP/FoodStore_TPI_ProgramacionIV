from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response

from app.core.deps import solo_admin
from app.modules.productos.schemas import (
    ProductoCreate, ProductoRead, ProductosPaginados, ProductoStockUpdate, ProductoUpdate,
)
from app.modules.productos.service import CategoriaNoEncontrada, ProductoNoEncontrado, ProductoService
from app.modules.productos.unit_of_work import ProductoUnitOfWork

router = APIRouter(prefix="/productos", tags=["Productos"])


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


Servicio = Annotated[ProductoService, Depends(get_producto_service)]


@router.get("", response_model=ProductosPaginados)
def listar(
    servicio: Servicio,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    search: str | None = None,
    categoria_id: Annotated[int | None, Query(ge=1, le=2147483647)] = None,
    disponible: bool | None = None,
) -> ProductosPaginados:
    return servicio.listar(skip=skip, limit=limit, search=search, categoria_id=categoria_id, disponible=disponible)


@router.get("/{id}", response_model=ProductoRead)
def obtener(id: int, servicio: Servicio) -> ProductoRead:
    try:
        return servicio.obtener(id)
    except ProductoNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.post("", response_model=ProductoRead, status_code=201, dependencies=[Depends(solo_admin)])
def crear(datos: ProductoCreate, servicio: Servicio) -> ProductoRead:
    try:
        return servicio.crear(datos)
    except CategoriaNoEncontrada as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.put("/{id}", response_model=ProductoRead, dependencies=[Depends(solo_admin)])
def actualizar(id: int, datos: ProductoUpdate, servicio: Servicio) -> ProductoRead:
    try:
        return servicio.actualizar(id, datos)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.patch("/{id}/stock", response_model=ProductoRead, dependencies=[Depends(solo_admin)])
def actualizar_stock(id: int, datos: ProductoStockUpdate, servicio: Servicio) -> ProductoRead:
    try:
        return servicio.actualizar_stock(id, datos)
    except ProductoNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.delete("/{id}", status_code=204, dependencies=[Depends(solo_admin)])
def eliminar(id: int, servicio: Servicio) -> Response:
    try:
        servicio.eliminar(id)
    except ProductoNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    return Response(status_code=204)
