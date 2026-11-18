
from collections.abc import Generator

from sqlmodel import SQLModel, Session, create_engine

from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL

if not DATABASE_URL:
    raise RuntimeError(
        "Falta configurar DATABASE_URL en el archivo backend/.env"
    )

engine = create_engine(DATABASE_URL, echo=False)


def session_factory() -> Session:
    return Session(engine)


def get_session() -> Generator[Session, None, None]:
    with session_factory() as session:
        yield session


def crear_tablas():
    # Importar los modelos para registrarlos antes de crear las tablas.
    from app.modules.categorias import models as categoria_model
    from app.modules.productos import models as producto_model
    from app.modules.pedidos import models as pedido_models
    from app.modules.usuarios import models as usuario_models

    SQLModel.metadata.create_all(engine)
