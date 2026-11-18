from sqlalchemy.dialects.postgresql import insert
from sqlmodel import Session

from app.core.database import crear_tablas
from app.core.security import hash_password
from app.modules.pedidos.catalogos import EstadoPedido, FormaPago
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


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

        sembrar_catalogos_de_pedidos(uow.session)


def main() -> None:
    crear_tablas()
    sembrar()
    print("Administrador de demostración y catálogos de pedidos inicializados.")


if __name__ == "__main__":
    main()
