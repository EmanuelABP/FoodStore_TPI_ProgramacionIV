from urllib.parse import quote

from sqlalchemy.dialects.postgresql import insert
from sqlmodel import Session

from app.core.database import crear_tablas
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.categorias.repository import CategoriaRepository
from app.modules.pedidos.catalogos import EstadoPedido, FormaPago
from app.modules.productos.models import Producto
from app.modules.productos.repository import ProductoRepository
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


CATALOGO_DEMO = {
    "Hamburguesas": (
        "Hamburguesas caseras con pan tostado.",
        [
            ("Hamburguesa clásica", "Carne, lechuga, tomate y aderezo.", 8500.0, 16),
            ("Hamburguesa con cheddar", "Carne, cheddar y cebolla caramelizada.", 9800.0, 12),
            ("Hamburguesa de lentejas", "Medallón de lentejas y vegetales.", 8200.0, 10),
        ],
    ),
    "Pizzas": (
        "Pizzas al horno con masa artesanal.",
        [
            ("Pizza muzzarella", "Salsa de tomate, muzzarella y aceitunas.", 12500.0, 14),
            ("Pizza napolitana", "Muzzarella, tomate fresco y ajo.", 14000.0, 10),
            ("Pizza fugazzeta", "Muzzarella y cebolla.", 14500.0, 8),
        ],
    ),
    "Acompañamientos": (
        "Porciones para acompañar el pedido.",
        [
            ("Papas fritas", "Porción de papas bastón.", 4200.0, 24),
            ("Aros de cebolla", "Porción de aros de cebolla crocantes.", 4900.0, 18),
        ],
    ),
}


def sembrar_catalogo(session: Session) -> None:
    categorias = CategoriaRepository(session)
    productos = ProductoRepository(session)

    for nombre, (descripcion, items) in CATALOGO_DEMO.items():
        session.execute(insert(Categoria).values(
            nombre=nombre, descripcion=descripcion,
        ).on_conflict_do_nothing(index_elements=["nombre"]))

        # Dos ejecuciones del seed usan el mismo bloqueo antes de revisar los productos.
        categoria = categorias.get_by_nombre(nombre, bloquear=True)
        assert categoria is not None and categoria.id is not None
        existentes = productos.list_names_by_category(categoria.id)

        # La categoría y el nombre identifican los registros demo, incluso dados de baja.
        for nombre_producto, detalle, precio, stock in items:
            if nombre_producto not in existentes:
                productos.add(Producto(
                    categoria_id=categoria.id,
                    nombre=nombre_producto,
                    descripcion=detalle,
                    precio_base=precio,
                    imagen_url=f"https://placehold.co/600x400?text={quote(nombre_producto)}",
                    stock=stock,
                ))


def sembrar_catalogos_de_pedidos(session: Session) -> None:
    # Se conservan los catálogos del módulo de pedidos hasta su adaptación al TPI.
    estados = [
        ("PENDIENTE", "Pendiente"), ("CONFIRMADO", "Confirmado"), ("EN_PREP", "En preparación"),
        ("EN_CAMINO", "En camino"), ("ENTREGADO", "Entregado"), ("CANCELADO", "Cancelado"),
    ]
    session.execute(insert(EstadoPedido).values([
        dict(codigo=codigo, descripcion=descripcion, orden=orden, es_terminal=codigo in {"ENTREGADO", "CANCELADO"})
        for orden, (codigo, descripcion) in enumerate(estados, 1)
    ]).on_conflict_do_nothing(index_elements=["codigo"]))
    session.execute(insert(FormaPago).values([
        {"codigo": "EFECTIVO", "descripcion": "Efectivo", "activo": True},
        {"codigo": "TARJETA", "descripcion": "Tarjeta", "activo": True},
        {"codigo": "TRANSFERENCIA", "descripcion": "Transferencia", "activo": True},
    ]).on_conflict_do_nothing(index_elements=["codigo"]))


def sembrar() -> None:
    with UsuarioUnitOfWork() as uow:
        usuarios = uow.usuarios
        usuario = usuarios.get_by_username("admin")
        if usuario is None:
            if usuarios.get_by_email("admin@foodstore.com") is not None:
                raise RuntimeError("El email de demostración ya pertenece a otra cuenta.")
            uow.session.execute(insert(Usuario).values(
                username="admin",
                full_name="Administrador Food Store",
                email="admin@foodstore.com",
                hashed_password=hash_password("Admin1234!"),
                role="admin",
            ).on_conflict_do_nothing(index_elements=["username"]))
            usuario = usuarios.get_by_username("admin")

        if usuario is None or usuario.role != "admin":
            raise RuntimeError("El username admin ya está reservado por una cuenta sin rol administrativo.")

        sembrar_catalogo(uow.session)
        sembrar_catalogos_de_pedidos(uow.session)


def main() -> None:
    crear_tablas()
    sembrar()
    print("Administrador, categorías y productos de demostración inicializados.")


if __name__ == "__main__":
    main()
