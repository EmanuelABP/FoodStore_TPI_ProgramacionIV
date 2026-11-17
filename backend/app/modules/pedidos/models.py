from datetime import datetime, timezone

from sqlalchemy import CheckConstraint, DateTime
from sqlmodel import Field, SQLModel


class Pedido(SQLModel, table=True):
    __tablename__ = "pedidos"

    id: int | None = Field(default=None, primary_key=True)
    fecha: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_type=DateTime(timezone=True),
    )
    usuario_id: int = Field(foreign_key="usuarios.id")
    estado: str = Field(default="PENDIENTE", foreign_key="estados_pedido.codigo")
    total: float = 0.0
    deleted_at: datetime | None = Field(default=None, sa_type=DateTime(timezone=True))


class DetallePedido(SQLModel, table=True):
    __tablename__ = "detalle_pedido"
    __table_args__ = (
        CheckConstraint("cantidad >= 1", name="ck_detalle_pedido_cantidad"),
    )

    pedido_id: int = Field(foreign_key="pedidos.id", primary_key=True)
    producto_id: int = Field(foreign_key="productos.id", primary_key=True)
    cantidad: int
    precio_unitario: float
