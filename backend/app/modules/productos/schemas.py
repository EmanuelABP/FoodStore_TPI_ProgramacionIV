from typing import Annotated

from pydantic import Field, StringConstraints, field_validator
from pydantic.json_schema import SkipJsonSchema
from sqlmodel import SQLModel

from app.modules.categorias.schemas import CategoriaRead

NombreProducto = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]
PrecioProducto = Annotated[float, Field(ge=0, allow_inf_nan=False)]
StockProducto = Annotated[int, Field(ge=0, le=2147483647, strict=True)]
CategoriaId = Annotated[int, Field(ge=1, le=2147483647, strict=True)]


class ProductoCreate(SQLModel):
    nombre: NombreProducto
    descripcion: str | None = None
    precio_base: PrecioProducto
    imagen_url: str | None = None
    stock: StockProducto = 0
    disponible: bool = True
    categoria_id: CategoriaId


class ProductoUpdate(SQLModel):
    nombre: NombreProducto | SkipJsonSchema[None] = None
    descripcion: str | None = None
    precio_base: PrecioProducto | SkipJsonSchema[None] = None
    imagen_url: str | None = None
    stock: StockProducto | SkipJsonSchema[None] = None
    disponible: bool | SkipJsonSchema[None] = None
    categoria_id: CategoriaId | SkipJsonSchema[None] = None

    @field_validator("nombre", "precio_base", "stock", "disponible", "categoria_id")
    @classmethod
    def validar_no_nulo(cls, value: str | float | int | bool | None):
        if value is None:
            raise ValueError("El campo no puede ser nulo.")
        return value


class ProductoRead(ProductoCreate):
    id: int
    activo: bool
    categoria: CategoriaRead


class ProductoStockUpdate(SQLModel):
    stock: StockProducto
    disponible: bool


class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoRead]
