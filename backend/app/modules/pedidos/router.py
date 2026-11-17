from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response
from app.core.security import get_current_active_user, require_role, solo_admin
from app.modules.usuarios.models import Usuario

from app.modules.pedidos import service
from app.modules.pedidos.schemas import PedidoCreate, PedidoRead, PedidoResumen, PedidoUpdate

router = APIRouter(prefix="/pedidos", tags=["Pedidos"], dependencies=[Depends(get_current_active_user)])
Creador = Annotated[Usuario, Depends(require_role(["user", "admin"]))]


@router.get("", response_model=list[PedidoResumen])
def listar():
    return service.listar()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener(pedido_id: int):
    try:
        return service.obtener(pedido_id)
    except service.RecursoNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.post("", response_model=PedidoRead, status_code=201)
def crear(datos: PedidoCreate, usuario: Creador):
    try:
        assert usuario.id is not None
        return service.crear(datos, usuario.id)
    except service.RecursoNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except service.PedidoInvalido as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


@router.put("/{pedido_id}", response_model=PedidoRead, dependencies=[Depends(solo_admin)])
def actualizar(pedido_id: int, datos: PedidoUpdate):
    try:
        return service.actualizar(pedido_id, datos)
    except service.RecursoNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.delete("/{pedido_id}", status_code=204, dependencies=[Depends(solo_admin)])
def eliminar(pedido_id: int):
    try:
        service.eliminar(pedido_id)
    except service.RecursoNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    return Response(status_code=204)
