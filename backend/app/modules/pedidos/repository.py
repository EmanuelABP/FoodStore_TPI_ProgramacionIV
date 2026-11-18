from datetime import datetime

from sqlalchemy.orm import selectinload
from sqlmodel import Session, func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Estado, Pedido
from app.modules.productos.models import Producto
from app.modules.productos.repository import ProductoRepository


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def obtener_con_items(self, pedido_id: int, *, bloquear: bool = False) -> Pedido | None:
        consulta = select(Pedido).where(Pedido.id == pedido_id).options(selectinload(Pedido.items))
        if bloquear:
            consulta = consulta.with_for_update()
        return self.session.exec(consulta).first()

    def list_by_usuario(
        self, usuario_id: int | None, *, estado: Estado | None, skip: int, limit: int,
    ) -> tuple[int, list[Pedido]]:
        consulta = select(Pedido)
        if usuario_id is not None:
            consulta = consulta.where(Pedido.usuario_id == usuario_id)
        if estado is not None:
            consulta = consulta.where(Pedido.estado == estado)

        total = self.session.exec(select(func.count()).select_from(consulta.subquery())).one()
        pagina = consulta.options(selectinload(Pedido.items)).order_by(Pedido.id.desc()).offset(skip).limit(limit)
        return total, list(self.session.exec(pagina).all())

    def agregar_resumen(self, inicio: datetime, fin: datetime) -> tuple[int, int, int, int, int, float]:
        entregado = Pedido.estado == "ENTREGADO"
        consulta = select(
            func.count().filter(Pedido.estado == "PENDIENTE"),
            func.count().filter(Pedido.estado == "EN_PREPARACION"),
            func.count().filter(entregado),
            func.count().filter(Pedido.estado == "CANCELADO"),
            func.count().filter(Pedido.created_at >= inicio, Pedido.created_at < fin),
            func.coalesce(func.sum(Pedido.total).filter(entregado), 0.0),
        ).select_from(Pedido)
        return self.session.exec(consulta).one()._tuple()


class ProductoPedidoRepository(ProductoRepository):
    def obtener_para_stock(self, producto_id: int) -> Producto | None:
        consulta = select(Producto).where(Producto.id == producto_id).with_for_update()
        return self.session.exec(consulta).first()
