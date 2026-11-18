from datetime import datetime
from typing import Annotated

from pydantic import Field, StringConstraints
from sqlmodel import SQLModel

from app.modules.pedidos.models import Estado, FormaPago


class ItemPedidoCreate(SQLModel):
    producto_id: int
    cantidad: Annotated[int, Field(strict=True, ge=1, le=2147483647)]


class PedidoCreate(SQLModel):
    items: Annotated[list[ItemPedidoCreate], Field(min_length=1)]
    forma_pago: FormaPago
    direccion_entrega: Annotated[str, StringConstraints(strip_whitespace=True, min_length=5, max_length=200)]
    notas: str | None = None


class DetallePedidoRead(SQLModel):
    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    estado: Estado
    forma_pago: FormaPago
    direccion_entrega: str
    notas: str | None
    total: float
    created_at: datetime
    updated_at: datetime
    items: list[DetallePedidoRead]


class PedidosPaginados(SQLModel):
    total: int
    items: list[PedidoRead]


class CambioEstado(SQLModel):
    estado: Estado


class ResumenPedidos(SQLModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float
