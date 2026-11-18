from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Query

from app.core.deps import UsuarioActivo, solo_admin
from app.modules.pedidos.models import Estado
from app.modules.pedidos.schemas import CambioEstado, PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from app.modules.pedidos.service import (
    PedidoAjeno, PedidoNoEncontrado, PedidoService, ProductoNoEncontrado, ReglaPedidoInvalida,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


Servicio = Annotated[PedidoService, Depends(get_pedido_service)]
PedidoId = Annotated[int, Path()]


@router.post("", response_model=PedidoRead, status_code=201)
def crear(datos: PedidoCreate, usuario: UsuarioActivo, servicio: Servicio):
    try:
        return servicio.crear(datos, usuario)
    except ProductoNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except ReglaPedidoInvalida as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@router.get("", response_model=PedidosPaginados)
def listar(
    usuario: UsuarioActivo,
    servicio: Servicio,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: Estado | None = None,
):
    return servicio.listar(usuario, skip=skip, limit=limit, estado=estado)


@router.get("/resumen", response_model=ResumenPedidos, dependencies=[Depends(solo_admin)])
def resumen(servicio: Servicio):
    return servicio.resumen()


@router.get("/{id}", response_model=PedidoRead)
def obtener(id: PedidoId, usuario: UsuarioActivo, servicio: Servicio):
    try:
        return servicio.obtener(id, usuario)
    except PedidoNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except PedidoAjeno as error:
        raise HTTPException(status_code=403, detail=str(error)) from error


@router.patch("/{id}/estado", response_model=PedidoRead, dependencies=[Depends(solo_admin)])
def cambiar_estado(id: PedidoId, datos: CambioEstado, servicio: Servicio):
    try:
        return servicio.cambiar_estado(id, datos.estado)
    except (PedidoNoEncontrado, ProductoNoEncontrado) as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except ReglaPedidoInvalida as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@router.patch("/{id}/cancelar", response_model=PedidoRead)
def cancelar(id: PedidoId, usuario: UsuarioActivo, servicio: Servicio):
    try:
        return servicio.cancelar_propio(id, usuario)
    except (PedidoNoEncontrado, ProductoNoEncontrado) as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except PedidoAjeno as error:
        raise HTTPException(status_code=403, detail=str(error)) from error
    except ReglaPedidoInvalida as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
