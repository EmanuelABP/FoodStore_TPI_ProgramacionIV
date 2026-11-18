from app.core.unit_of_work import UnitOfWork
from app.modules.usuarios.repository import UsuarioRepository


class UsuarioUnitOfWork(UnitOfWork):
    @property
    def usuarios(self) -> UsuarioRepository:
        return UsuarioRepository(self.session)
