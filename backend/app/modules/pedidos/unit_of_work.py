from app.core.unit_of_work import UnitOfWork
from app.modules.pedidos.repository import PedidoRepository, ProductoPedidoRepository


class PedidoUnitOfWork(UnitOfWork):
    @property
    def pedidos(self) -> PedidoRepository:
        return PedidoRepository(self.session)

    @property
    def productos(self) -> ProductoPedidoRepository:
        return ProductoPedidoRepository(self.session)
