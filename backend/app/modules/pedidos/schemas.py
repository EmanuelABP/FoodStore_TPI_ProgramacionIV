from datetime import datetime
from typing import Annotated, Literal, Self

from pydantic import BaseModel, ConfigDict, Field, model_validator

Estado = Literal["PENDIENTE", "CONFIRMADO", "EN_PREP", "EN_CAMINO", "ENTREGADO", "CANCELADO"]


class DetalleCreate(BaseModel):
    producto_id: int
    cantidad: Annotated[int, Field(strict=True, ge=1, le=2147483647)]


class PedidoCreate(BaseModel):
    detalles: Annotated[list[DetalleCreate], Field(min_length=1)]

    @model_validator(mode="after")
    def validar_productos(self) -> Self:
        if len({detalle.producto_id for detalle in self.detalles}) != len(self.detalles):
            raise ValueError("No se puede repetir un producto en el pedido.")
        return self


class PedidoUpdate(BaseModel):
    estado: Estado


class DetalleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    pedido_id: int
    producto_id: int
    cantidad: int
    precio_unitario: float


class PedidoResumen(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    usuario_id: int
    fecha: datetime
    estado: Estado
    total: float
    deleted_at: datetime | None


class PedidoRead(PedidoResumen):
    detalles: list[DetalleRead]
