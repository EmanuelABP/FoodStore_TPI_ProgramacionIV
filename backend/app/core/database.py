
import os
from pathlib import Path

from dotenv import load_dotenv
from sqlmodel import SQLModel, Session, create_engine

# Cargar las variables de entorno desde backend/.env
BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "Falta configurar DATABASE_URL en el archivo backend/.env"
    )

engine = create_engine(DATABASE_URL, echo=False)


def get_session():
    with Session(engine) as session:
        yield session


def crear_tablas():
    # Importar los modelos para registrarlos antes de crear las tablas.
    from app.categoria import model as categoria_model
    from app.producto import model as producto_model

    from app.ingrediente import model as ingrediente_model
    from app.modules.pedidos import models as pedido_models

    from app.modules.pedidos import catalogos
    from app.modules.usuarios import models as usuario_models

    SQLModel.metadata.create_all(engine)
