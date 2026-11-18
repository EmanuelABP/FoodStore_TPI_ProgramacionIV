from sqlalchemy.dialects.postgresql import insert
from sqlmodel import Session

from app.core.database import crear_tablas
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.categorias.repository import CategoriaRepository
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


# Fotografías ilustrativas de Pexels, https://www.pexels.com/license/
# Cada ID identifica una fotografía fija. El seed conserva los registros existentes.
IMAGENES_DEMO = {
    "Hamburguesa clásica": "https://images.pexels.com/photos/10500520/pexels-photo-10500520.jpeg?auto=compress&cs=tinysrgb&w=960",
    "Hamburguesa con cheddar": "https://images.pexels.com/photos/15226134/pexels-photo-15226134.jpeg?auto=compress&cs=tinysrgb&w=960",
    "Hamburguesa de lentejas": "https://images.pexels.com/photos/8472241/pexels-photo-8472241.jpeg?auto=compress&cs=tinysrgb&w=960",
    "Pizza muzzarella": "https://images.pexels.com/photos/10880324/pexels-photo-10880324.jpeg?auto=compress&cs=tinysrgb&w=960",
    "Pizza napolitana": "https://images.pexels.com/photos/6223177/pexels-photo-6223177.jpeg?auto=compress&cs=tinysrgb&w=960",
    "Pizza fugazzeta": "https://images.pexels.com/photos/17637066/pexels-photo-17637066.png?auto=compress&cs=tinysrgb&w=960",
    "Papas fritas": "https://images.pexels.com/photos/6975532/pexels-photo-6975532.jpeg?auto=compress&cs=tinysrgb&w=960",
    "Aros de cebolla": "https://images.pexels.com/photos/34528321/pexels-photo-34528321.jpeg?auto=compress&cs=tinysrgb&w=960",
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
                    imagen_url=IMAGENES_DEMO[nombre_producto],
                    stock=stock,
                ))


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


def main() -> None:
    crear_tablas()
    sembrar()
    print("Administrador, categorías y productos de demostración inicializados.")


if __name__ == "__main__":
    main()
