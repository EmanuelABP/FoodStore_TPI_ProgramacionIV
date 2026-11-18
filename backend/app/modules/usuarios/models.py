from datetime import datetime, timezone
from typing import TYPE_CHECKING, Literal

from sqlalchemy import CheckConstraint, DateTime, String, UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.pedidos.models import Pedido

Role = Literal["user", "admin"]


def ahora() -> datetime:
    return datetime.now(timezone.utc)


class Usuario(SQLModel, table=True):
    __tablename__ = "usuarios"
    __table_args__ = (
        UniqueConstraint("username", name="uq_usuarios_username"),
        UniqueConstraint("email", name="uq_usuarios_email"),
        CheckConstraint("role IN ('user', 'admin')", name="ck_usuarios_role"),
    )

    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(max_length=255)
    full_name: str
    email: str = Field(max_length=254)
    hashed_password: str = Field(max_length=60)
    role: Role = Field(default="user", sa_type=String(5))
    disabled: bool = False
    created_at: datetime = Field(default_factory=ahora, sa_type=DateTime(timezone=True))

    pedidos: list["Pedido"] = Relationship(back_populates="usuario")
