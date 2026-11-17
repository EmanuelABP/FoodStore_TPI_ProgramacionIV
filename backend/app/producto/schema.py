from datetime import datetime
from typing import Annotated

from pydantic import Field, StringConstraints, field_validator
from sqlmodel import SQLModel

IngredienteId = Annotated[int, Field(strict=True, gt=0, le=2147483647)]


class ProductoDatos(SQLModel):
    nombre: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=150)]
    descripcion: str = Field(min_length=1)
    precio_base: float = Field(ge=0, allow_inf_nan=False)
    imagenes_url: list[str] = Field(default_factory=list)
    disponible: bool = True


class ProductoCreate(ProductoDatos):
    ingrediente_ids: list[IngredienteId] = Field(default_factory=list)

    @field_validator("ingrediente_ids")
    @classmethod
    def ingredientes_distintos(cls, ids: list[int]) -> list[int]:
        if len(ids) != len(set(ids)):
            raise ValueError("No se puede repetir un ingrediente.")
        return ids


class ProductoUpdate(ProductoCreate):
    pass


class CategoriaProductoRead(SQLModel):
    id: int
    nombre: str
    descripcion: str
    deleted_at: datetime | None
    es_principal: bool


class ProductoRead(ProductoDatos):
    id: int
    ingrediente_ids: list[int]
    categorias: list[CategoriaProductoRead]


class ProductoPaginatedResponse(SQLModel):
    total: int
    items: list[ProductoRead]


class ProductoCategoriaCreate(SQLModel):
    categoria_id: int
    es_principal: bool = False


class ProductoCategoriaRead(SQLModel):
    producto_id: int
    categoria_id: int
    es_principal: bool
