from typing import Annotated

from pydantic import StringConstraints, field_validator
from pydantic.json_schema import SkipJsonSchema
from sqlmodel import SQLModel

NombreCategoria = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=100)]


class CategoriaCreate(SQLModel):
    nombre: NombreCategoria
    descripcion: str | None = None


class CategoriaUpdate(SQLModel):
    nombre: NombreCategoria | SkipJsonSchema[None] = None
    descripcion: str | None = None

    @field_validator("nombre")
    @classmethod
    def validar_nombre(cls, value: str | None) -> str:
        if value is None:
            raise ValueError("El nombre no puede ser nulo.")
        return value


class CategoriaRead(CategoriaCreate):
    id: int
    activo: bool
