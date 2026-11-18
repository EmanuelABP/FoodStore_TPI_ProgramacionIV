from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def get_active_by_id(self, producto_id: int, *, bloquear: bool = False) -> Producto | None:
        stmt = (
            select(Producto)
            .where(Producto.id == producto_id, Producto.activo)
            .options(selectinload(Producto.categoria))
        )
        if bloquear:
            stmt = stmt.with_for_update()
        return self.session.exec(stmt).first()

    def search(
        self, *, skip: int, limit: int, search: str | None,
        categoria_id: int | None, disponible: bool | None,
    ) -> tuple[int, list[Producto]]:
        stmt = select(Producto).where(Producto.activo)
        if search:
            stmt = stmt.where(col(Producto.nombre).icontains(search, autoescape=True))
        if categoria_id is not None:
            stmt = stmt.where(Producto.categoria_id == categoria_id)
        if disponible is not None:
            stmt = stmt.where(Producto.disponible == disponible)

        total = self.session.exec(select(func.count()).select_from(stmt.subquery())).one()
        pagina = stmt.options(selectinload(Producto.categoria)).order_by(Producto.id).offset(skip).limit(limit)
        return total, list(self.session.exec(pagina).all())

    def list_names_by_category(self, categoria_id: int) -> set[str]:
        stmt = select(Producto.nombre).where(Producto.categoria_id == categoria_id)
        return set(self.session.exec(stmt).all())
