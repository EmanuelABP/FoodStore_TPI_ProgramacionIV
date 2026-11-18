from sqlalchemy.exc import IntegrityError

from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


def _es_nombre_duplicado(error: IntegrityError) -> bool:
    return getattr(getattr(error.orig, "diag", None), "constraint_name", None) == "uq_categorias_nombre"


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(categoria) for categoria in uow.categorias.list_active()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_active_by_id(categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada("Categoría no encontrada.")
            return CategoriaRead.model_validate(categoria)

    def crear(self, datos: CategoriaCreate) -> CategoriaRead:
        try:
            with self.uow as uow:
                categoria = Categoria.model_validate(datos)
                uow.categorias.add(categoria)
                uow.session.flush()
                return CategoriaRead.model_validate(categoria)
        except IntegrityError as error:
            if _es_nombre_duplicado(error):
                raise NombreDuplicado("Ya existe una categoría con ese nombre.") from error
            raise

    def actualizar(self, categoria_id: int, datos: CategoriaUpdate) -> CategoriaRead:
        try:
            with self.uow as uow:
                categoria = uow.categorias.get_active_by_id(categoria_id, bloquear=True)
                if categoria is None:
                    raise CategoriaNoEncontrada("Categoría no encontrada.")
                categoria.sqlmodel_update(datos.model_dump(exclude_unset=True))
                return CategoriaRead.model_validate(categoria)
        except IntegrityError as error:
            if _es_nombre_duplicado(error):
                raise NombreDuplicado("Ya existe una categoría con ese nombre.") from error
            raise

    def eliminar(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = uow.categorias.get_active_by_id(categoria_id, bloquear=True)
            if categoria is None:
                raise CategoriaNoEncontrada("Categoría no encontrada.")
            categoria.activo = False
