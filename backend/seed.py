from argparse import ArgumentParser
from getpass import getpass

from fastapi import HTTPException
from pydantic import ValidationError
from sqlalchemy.dialects.postgresql import insert
from sqlmodel import Session

from app.core.database import crear_tablas, engine
from app.modules.pedidos.catalogos import EstadoPedido, FormaPago
from app.modules.usuarios.models import Rol
from app.modules.usuarios.schemas import UserCreate
from app.modules.usuarios.service import registrar


def sembrar() -> None:
    estados = [
        ("PENDIENTE", "Pendiente"), ("CONFIRMADO", "Confirmado"), ("EN_PREP", "En preparación"),
        ("EN_CAMINO", "En camino"), ("ENTREGADO", "Entregado"), ("CANCELADO", "Cancelado"),
    ]
    with Session(engine) as session:
        session.execute(insert(Rol).values([
            {"nombre": "admin", "descripcion": "Administración de Food Store"},
            {"nombre": "user", "descripcion": "Usuario de Food Store"},
        ]).on_conflict_do_nothing(index_elements=["nombre"]))
        session.execute(insert(EstadoPedido).values([
            dict(codigo=codigo, descripcion=descripcion, orden=orden, es_terminal=codigo in {"ENTREGADO", "CANCELADO"})
            for orden, (codigo, descripcion) in enumerate(estados, 1)
        ]).on_conflict_do_nothing(index_elements=["codigo"]))
        session.execute(insert(FormaPago).values([
            {"codigo": "EFECTIVO", "descripcion": "Efectivo", "activo": True},
            {"codigo": "TARJETA", "descripcion": "Tarjeta", "activo": True},
            {"codigo": "TRANSFERENCIA", "descripcion": "Transferencia", "activo": True},
        ]).on_conflict_do_nothing(index_elements=["codigo"]))
        session.commit()


def main() -> None:
    parser = ArgumentParser(description="Inicializar los catálogos de Food Store.")
    parser.add_argument("--admin-email", help="Crear una cuenta administradora nueva.")
    args = parser.parse_args()
    crear_tablas()
    sembrar()
    if args.admin_email:
        password = getpass("Contraseña del administrador: ")
        try:
            datos = UserCreate(nombre="Administrador", apellido="Food Store", email=args.admin_email, password=password)
            with Session(engine) as session:
                registrar(session, datos, rol="admin")
        except ValidationError:
            raise SystemExit("Ingresá un email válido y una contraseña de al menos 8 caracteres y hasta 72 bytes.")
        except HTTPException as error:
            raise SystemExit(error.detail) from None
        print("Cuenta administradora creada.")
    else:
        print("Catálogos inicializados.")


if __name__ == "__main__":
    main()
