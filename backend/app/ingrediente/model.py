from datetime import datetime

from sqlalchemy import DateTime
from app.core.catalogo import indice_nombre_activo
from sqlmodel import Field, SQLModel


class Ingrediente(SQLModel, table=True):
    __tablename__ = "ingredientes"
    __table_args__ = (indice_nombre_activo(__tablename__),)

    deleted_at: datetime | None = Field(default=None, sa_type=DateTime(timezone=True))

    id: int | None = Field(default=None, primary_key=True)
    nombre: str
