
from datetime import datetime

from sqlalchemy import DateTime
from app.core.catalogo import indice_nombre_activo
from sqlmodel import SQLModel, Field
from sqlalchemy import CheckConstraint, Column, Index, String, text
from sqlalchemy.dialects.postgresql import ARRAY


class Producto(SQLModel, table=True):
    __tablename__ = "productos"

    deleted_at: datetime | None = Field(default=None, sa_type=DateTime(timezone=True))

    __table_args__ = (
        CheckConstraint("precio_base >= 0", name="ck_producto_precio"),
        indice_nombre_activo(__tablename__),
    )

    id: int | None = Field(default=None, primary_key=True)
    nombre: str
    descripcion: str
    precio_base: float = Field(ge=0)
    imagenes_url: list[str] = Field(
        default_factory=list,
        sa_column=Column(ARRAY(String), nullable=False),
    )
    disponible: bool = Field(default=True)


class ProductoCategoria(SQLModel, table=True):
    __tablename__ = "producto_categoria"
    __table_args__ = (
        Index("uq_producto_categoria_principal", "producto_id", unique=True, postgresql_where=text("es_principal IS TRUE")),
    )

    es_principal: bool = Field(default=False, sa_column_kwargs={"server_default": text("false")})

    producto_id: int = Field(
        foreign_key="productos.id",
        primary_key=True,
    )

    categoria_id: int = Field(
        foreign_key="categorias.id",
        primary_key=True,
    )


class ProductoIngrediente(SQLModel, table=True):
    __tablename__ = "producto_ingrediente"

    producto_id: int = Field(foreign_key="productos.id", primary_key=True)
    ingrediente_id: int = Field(foreign_key="ingredientes.id", primary_key=True)
