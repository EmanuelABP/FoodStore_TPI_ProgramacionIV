from types import TracebackType
from typing import Self

from sqlmodel import Session

from app.core.database import engine
from app.modules.pedidos.repository import DetalleRepository, PedidoRepository, ProductoRepository


class PedidoUnitOfWork:
    def __enter__(self) -> Self:
        self.session = Session(engine)
        self.pedidos = PedidoRepository(self.session)
        self.detalles = DetalleRepository(self.session)
        self.productos = ProductoRepository(self.session)
        return self

    def __exit__(
        self,
        error_tipo: type[BaseException] | None,
        error: BaseException | None,
        traceback: TracebackType | None,
    ) -> None:
        try:
            if error_tipo is None:
                self.session.commit()
            else:
                self.session.rollback()
        except BaseException:
            self.session.rollback()
            raise
        finally:
            self.session.close()
