from datetime import timedelta, timezone
from zoneinfo import ZoneInfo
from math import fsum, isfinite

from app.modules.pedidos.models import DetallePedido, Estado, Pedido, ahora_utc
from app.modules.pedidos.schemas import PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import Usuario


TRANSICIONES: dict[Estado, set[Estado]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}
STOCK_MAXIMO = 2147483647


class PedidoNoEncontrado(Exception):
    pass


class ProductoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class ReglaPedidoInvalida(Exception):
    pass


class ProductoRepetido(ReglaPedidoInvalida):
    pass


class ProductoNoDisponible(ReglaPedidoInvalida):
    pass


class StockInsuficiente(ReglaPedidoInvalida):
    pass


class TransicionInvalida(ReglaPedidoInvalida):
    pass


def _obtener(uow: PedidoUnitOfWork, pedido_id: int, *, bloquear: bool = False) -> Pedido:
    pedido = uow.pedidos.obtener_con_items(pedido_id, bloquear=bloquear)
    if pedido is None:
        raise PedidoNoEncontrado("Pedido no encontrado.")
    return pedido


def _exigir_propietario(pedido: Pedido, usuario: Usuario) -> None:
    if pedido.usuario_id != usuario.id:
        raise PedidoAjeno("No tenés permiso para acceder a este pedido.")


def _cambiar_estado(uow: PedidoUnitOfWork, pedido: Pedido, destino: Estado) -> None:
    if destino not in TRANSICIONES[pedido.estado]:
        raise TransicionInvalida(f"No se puede cambiar de {pedido.estado} a {destino}.")

    if destino == "CANCELADO":
        productos = uow.productos
        # Mantengo el orden de bloqueos del alta y repongo también los productos dados de baja.
        for item in sorted(pedido.items, key=lambda item: item.producto_id):
            producto = productos.obtener_para_stock(item.producto_id)
            if producto is None:
                raise ProductoNoEncontrado(f"Producto {item.producto_id} no encontrado.")
            if producto.stock + item.cantidad > STOCK_MAXIMO:
                raise ReglaPedidoInvalida(f"La restitución del producto {item.producto_id} excede el stock máximo.")
            producto.stock += item.cantidad

    pedido.estado = destino
    pedido.updated_at = ahora_utc()


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    def crear(self, datos: PedidoCreate, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            if len({item.producto_id for item in datos.items}) != len(datos.items):
                raise ProductoRepetido("No se puede repetir un producto en el pedido.")

            assert usuario.id is not None
            fecha = ahora_utc()
            pedido = Pedido(
                usuario_id=usuario.id, forma_pago=datos.forma_pago,
                direccion_entrega=datos.direccion_entrega, notas=datos.notas,
                created_at=fecha, updated_at=fecha,
            )
            uow.pedidos.add(pedido)
            productos = uow.productos

            # Bloqueo los productos en orden para evitar conflictos entre compras concurrentes.
            for item in sorted(datos.items, key=lambda item: item.producto_id):
                producto = productos.obtener_para_stock(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(f"Producto {item.producto_id} no encontrado.")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"El producto {item.producto_id} no está disponible.")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(f"Stock insuficiente para el producto {item.producto_id}.")

                producto.stock -= item.cantidad
                pedido.items.append(DetallePedido(
                    producto_id=item.producto_id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=producto.precio_base * item.cantidad,
                ))

            try:
                pedido.total = fsum(item.subtotal for item in pedido.items)
            except OverflowError as error:
                raise ReglaPedidoInvalida("El total del pedido excede el rango permitido.") from error
            if not isfinite(pedido.total):
                raise ReglaPedidoInvalida("El total del pedido excede el rango permitido.")

            uow.session.flush()
            return PedidoRead.model_validate(pedido)

    def listar(self, usuario: Usuario, *, skip: int, limit: int, estado: Estado | None) -> PedidosPaginados:
        with self.uow as uow:
            assert usuario.id is not None
            total, pedidos = uow.pedidos.list_by_usuario(
                None if usuario.role == "admin" else usuario.id, estado=estado, skip=skip, limit=limit,
            )
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(pedido) for pedido in pedidos])

    def obtener(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = _obtener(uow, pedido_id)
            if usuario.role != "admin":
                _exigir_propietario(pedido, usuario)
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, destino: Estado) -> PedidoRead:
        with self.uow as uow:
            pedido = _obtener(uow, pedido_id, bloquear=True)
            _cambiar_estado(uow, pedido, destino)
            return PedidoRead.model_validate(pedido)

    def cancelar_propio(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = _obtener(uow, pedido_id, bloquear=True)
            _exigir_propietario(pedido, usuario)
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida("Solo podés cancelar un pedido propio que esté pendiente.")
            _cambiar_estado(uow, pedido, "CANCELADO")
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            zona = ZoneInfo("America/Argentina/Buenos_Aires")
            inicio_local = ahora_utc().astimezone(zona).replace(
                hour=0, minute=0, second=0, microsecond=0, fold=0,
            )
            inicio = inicio_local.astimezone(timezone.utc)
            fin = (inicio_local + timedelta(days=1)).astimezone(timezone.utc)
            pendientes, en_preparacion, entregados, cancelados, pedidos_hoy, ingresos = (
                uow.pedidos.agregar_resumen(inicio, fin)
            )
            return ResumenPedidos(
                pendientes=pendientes, en_preparacion=en_preparacion, entregados=entregados,
                cancelados=cancelados, pedidos_hoy=pedidos_hoy, ingresos_entregados=ingresos,
            )
