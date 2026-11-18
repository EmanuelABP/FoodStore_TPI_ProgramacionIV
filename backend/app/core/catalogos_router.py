from fastapi import APIRouter, Depends
from sqlmodel import select

from app.core.deps import Sesion, get_current_active_user
from app.modules.pedidos.catalogos import EstadoPedido, FormaPago

router = APIRouter(prefix="/api/v1", tags=["Catálogos"], dependencies=[Depends(get_current_active_user)])


@router.get("/estados-pedido", response_model=list[EstadoPedido])
def estados(session: Sesion):
    return list(session.exec(select(EstadoPedido).order_by(EstadoPedido.orden)).all())


@router.get("/formas-pago", response_model=list[FormaPago])
def formas_pago(session: Sesion):
    return list(session.exec(select(FormaPago).order_by(FormaPago.codigo)).all())
