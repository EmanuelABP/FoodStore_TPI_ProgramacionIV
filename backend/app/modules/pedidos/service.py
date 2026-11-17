from datetime import datetime, timezone
from math import fsum, isfinite

from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import DetalleRead, PedidoCreate, PedidoRead, PedidoResumen, PedidoUpdate
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork


class RecursoNoEncontrado(Exception):
    pass


class PedidoInvalido(Exception):
    pass


def _obtener(uow: PedidoUnitOfWork, pedido_id: int, *, bloquear: bool = False) -> Pedido:
    pedido = uow.pedidos.obtener(pedido_id, bloquear=bloquear)
    if pedido is None:
        raise RecursoNoEncontrado("Pedido no encontrado.")
    return pedido


def _respuesta(pedido: Pedido, detalles: list[DetallePedido]) -> PedidoRead:
    return PedidoRead(
        **PedidoResumen.model_validate(pedido).model_dump(),
        detalles=[DetalleRead.model_validate(detalle) for detalle in detalles],
    )


def listar() -> list[PedidoResumen]:
    with PedidoUnitOfWork() as uow:
        return [PedidoResumen.model_validate(pedido) for pedido in uow.pedidos.listar()]


def obtener(pedido_id: int) -> PedidoRead:
    with PedidoUnitOfWork() as uow:
        return _respuesta(_obtener(uow, pedido_id), uow.detalles.listar(pedido_id))


def crear(datos: PedidoCreate, usuario_id: int) -> PedidoRead:
    with PedidoUnitOfWork() as uow:
        pedido = Pedido(usuario_id=usuario_id)
        pedido_id = uow.pedidos.crear(pedido)
        detalles = []
        # Tomo los bloqueos de productos en el mismo orden para todas las altas.
        for item in sorted(datos.detalles, key=lambda item: item.producto_id):
            producto = uow.productos.obtener(item.producto_id)
            if producto is None:
                raise RecursoNoEncontrado(f"Producto {item.producto_id} no encontrado.")
            detalle = DetallePedido(
                pedido_id=pedido_id,
                producto_id=item.producto_id,
                cantidad=item.cantidad,
                precio_unitario=producto.precio_base,
            )
            uow.detalles.crear(detalle)
            detalles.append(detalle)
        try:
            pedido.total = fsum(detalle.cantidad * detalle.precio_unitario for detalle in detalles)
        except OverflowError as error:
            raise PedidoInvalido("El total del pedido excede el rango permitido.") from error
        if not isfinite(pedido.total):
            raise PedidoInvalido("El total del pedido excede el rango permitido.")
        return _respuesta(pedido, detalles)


def actualizar(pedido_id: int, datos: PedidoUpdate) -> PedidoRead:
    with PedidoUnitOfWork() as uow:
        pedido = _obtener(uow, pedido_id, bloquear=True)
        pedido.estado = datos.estado
        return _respuesta(pedido, uow.detalles.listar(pedido_id))


def eliminar(pedido_id: int) -> None:
    with PedidoUnitOfWork() as uow:
        pedido = _obtener(uow, pedido_id, bloquear=True)
        pedido.deleted_at = datetime.now(timezone.utc)
