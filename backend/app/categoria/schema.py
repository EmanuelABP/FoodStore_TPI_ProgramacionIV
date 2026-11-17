
from datetime import datetime
from typing import Annotated

from pydantic import StringConstraints
from sqlmodel import SQLModel


class CategoriaCreate(SQLModel):
    nombre: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
    descripcion: str = ""


class CategoriaUpdate(SQLModel):
    nombre: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
    descripcion: str = ""


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: str
    deleted_at: datetime | None


class CategoriaPaginatedResponse(SQLModel):
    total: int
    items: list[CategoriaRead]
