from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, EmailStr, Field, SecretStr, StringConstraints, field_validator

Nombre = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=80)]
Celular = Annotated[str, StringConstraints(strip_whitespace=True, max_length=20)]


class UserCreate(BaseModel):
    nombre: Nombre
    apellido: Nombre
    email: Annotated[EmailStr, Field(max_length=254)]
    celular: Celular | None = None
    password: Annotated[SecretStr, Field(min_length=8, max_length=72)]

    @field_validator("password")
    @classmethod
    def validar_bcrypt(cls, value: SecretStr) -> SecretStr:
        if len(value.get_secret_value().encode("utf-8")) > 72:
            raise ValueError("La contraseña admite hasta 72 bytes.")
        return value


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    apellido: str
    email: EmailStr
    celular: str | None
    roles: list[str]
    deleted_at: datetime | None


class RolPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    descripcion: str
