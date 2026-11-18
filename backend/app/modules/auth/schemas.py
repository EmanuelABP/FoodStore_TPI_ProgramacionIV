from typing import Annotated

from pydantic import EmailStr, SecretStr, StringConstraints, field_validator
from sqlmodel import Field, SQLModel


class UserCreate(SQLModel):
    username: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=255, pattern=r"^[^\x00]+$")]
    full_name: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, pattern=r"^[^\x00]+$")]
    email: Annotated[EmailStr, Field(max_length=254)]
    password: Annotated[SecretStr, Field(min_length=8)]

    @field_validator("password")
    @classmethod
    def validar_bcrypt(cls, value: SecretStr) -> SecretStr:
        password = value.get_secret_value()
        if "\0" in password:
            raise ValueError("La contraseña contiene un carácter inválido.")
        if len(password.encode("utf-8")) > 72:
            raise ValueError("La contraseña admite hasta 72 bytes.")
        return value
