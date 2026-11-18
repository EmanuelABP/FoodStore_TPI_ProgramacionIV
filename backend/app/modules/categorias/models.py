from typing import TYPE_CHECKING

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto


class Categoria(SQLModel, table=True):
    __tablename__ = "categorias"
    __table_args__ = (UniqueConstraint("nombre", name="uq_categorias_nombre"),)

    id: int | None = Field(default=None, primary_key=True)
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str | None = None
    activo: bool = True

    productos: list["Producto"] = Relationship(back_populates="categoria")
