from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository


class CategoriaUnitOfWork(UnitOfWork):
    @property
    def categorias(self) -> CategoriaRepository:
        return CategoriaRepository(self.session)
