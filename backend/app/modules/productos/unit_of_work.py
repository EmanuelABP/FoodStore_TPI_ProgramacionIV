from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository
from app.modules.productos.repository import ProductoRepository


class ProductoUnitOfWork(UnitOfWork):
    @property
    def productos(self) -> ProductoRepository:
        return ProductoRepository(self.session)

    @property
    def categorias(self) -> CategoriaRepository:
        return CategoriaRepository(self.session)
