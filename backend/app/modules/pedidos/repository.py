from sqlmodel import Session, select

from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.productos.models import Producto


class PedidoRepository:
    def __init__(self, session: Session):
        self.session = session

    def listar(self) -> list[Pedido]:
        consulta = select(Pedido).where(Pedido.deleted_at == None).order_by(Pedido.id)
        return list(self.session.exec(consulta).all())

    def obtener(self, pedido_id: int, *, bloquear: bool = False) -> Pedido | None:
        consulta = select(Pedido).where(Pedido.id == pedido_id, Pedido.deleted_at == None)
        if bloquear:
            consulta = consulta.with_for_update()
        return self.session.exec(consulta).first()

    def crear(self, pedido: Pedido) -> int:
        self.session.add(pedido)
        self.session.flush()
        assert pedido.id is not None
        return pedido.id


class DetalleRepository:
    def __init__(self, session: Session):
        self.session = session

    def listar(self, pedido_id: int) -> list[DetallePedido]:
        consulta = (
            select(DetallePedido)
            .where(DetallePedido.pedido_id == pedido_id)
            .order_by(DetallePedido.producto_id)
        )
        return list(self.session.exec(consulta).all())

    def crear(self, detalle: DetallePedido) -> None:
        self.session.add(detalle)
        self.session.flush()


class ProductoRepository:
    def __init__(self, session: Session):
        self.session = session

    def obtener(self, producto_id: int) -> Producto | None:
        consulta = (
            select(Producto)
            .where(Producto.id == producto_id, Producto.activo)
            .with_for_update(read=True)
        )
        return self.session.exec(consulta).first()
