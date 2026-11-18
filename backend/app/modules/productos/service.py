from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate, ProductoRead, ProductosPaginados, ProductoStockUpdate, ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    pass


class CategoriaNoEncontrada(Exception):
    pass


def _buscar_producto(uow: ProductoUnitOfWork, producto_id: int, *, bloquear: bool = False) -> Producto:
    producto = uow.productos.get_active_by_id(producto_id, bloquear=bloquear)
    if producto is None:
        raise ProductoNoEncontrado("Producto no encontrado.")
    return producto


def _buscar_categoria(uow: ProductoUnitOfWork, categoria_id: int) -> Categoria:
    categoria = uow.categorias.get_active_by_id(categoria_id, bloquear=True)
    if categoria is None:
        raise CategoriaNoEncontrada("Categoría no encontrada.")
    return categoria


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def listar(
        self, *, skip: int, limit: int, search: str | None,
        categoria_id: int | None, disponible: bool | None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, productos = uow.productos.search(
                skip=skip, limit=limit, search=search.strip() if search else None,
                categoria_id=categoria_id, disponible=disponible,
            )
            return ProductosPaginados(total=total, items=[ProductoRead.model_validate(p) for p in productos])

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            producto = _buscar_producto(uow, producto_id)
            return ProductoRead.model_validate(producto)

    def crear(self, datos: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            categoria = _buscar_categoria(uow, datos.categoria_id)
            producto = Producto(**datos.model_dump(), categoria=categoria)
            uow.productos.add(producto)
            uow.session.flush()
            return ProductoRead.model_validate(producto)

    def actualizar(self, producto_id: int, datos: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = _buscar_producto(uow, producto_id, bloquear=True)
            cambios = datos.model_dump(exclude_unset=True)
            if "categoria_id" in cambios and cambios["categoria_id"] != producto.categoria_id:
                producto.categoria = _buscar_categoria(uow, cambios["categoria_id"])
            producto.sqlmodel_update(cambios)
            return ProductoRead.model_validate(producto)

    def actualizar_stock(self, producto_id: int, datos: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = _buscar_producto(uow, producto_id, bloquear=True)
            producto.sqlmodel_update(datos.model_dump())
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = _buscar_producto(uow, producto_id, bloquear=True)
            producto.activo = False
