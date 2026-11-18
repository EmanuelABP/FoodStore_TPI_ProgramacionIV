from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Categoria)

    def list_active(self) -> list[Categoria]:
        stmt = select(Categoria).where(Categoria.activo).order_by(Categoria.id)
        return list(self.session.exec(stmt).all())

    def get_active_by_id(self, categoria_id: int, *, bloquear: bool = False) -> Categoria | None:
        stmt = select(Categoria).where(Categoria.id == categoria_id, Categoria.activo)
        if bloquear:
            stmt = stmt.with_for_update()
        return self.session.exec(stmt).first()

    def get_by_nombre(self, nombre: str, *, bloquear: bool = False) -> Categoria | None:
        stmt = select(Categoria).where(Categoria.nombre == nombre)
        if bloquear:
            stmt = stmt.with_for_update()
        return self.session.exec(stmt).first()
