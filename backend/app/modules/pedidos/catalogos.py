from sqlmodel import Field, SQLModel


class EstadoPedido(SQLModel, table=True):
    __tablename__ = "estados_pedido"

    codigo: str = Field(primary_key=True)
    descripcion: str
    orden: int
    es_terminal: bool


class FormaPago(SQLModel, table=True):
    __tablename__ = "formas_pago"

    codigo: str = Field(primary_key=True)
    descripcion: str
    activo: bool = True
