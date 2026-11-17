from typing import Generic, TypeVar

from sqlmodel import SQLModel, Session, select

ModelT = TypeVar("ModelT", bound=SQLModel)


class BaseRepository(Generic[ModelT]):
    def __init__(self, session: Session, model: type[ModelT]) -> None:
        self.session = session
        self.model = model

    def get_by_id(self, entity_id: int) -> ModelT | None:
        return self.session.get(self.model, entity_id)

    def get_all(self) -> list[ModelT]:
        return list(self.session.exec(select(self.model)).all())

    def add(self, entity: ModelT) -> None:
        self.session.add(entity)

    def delete(self, entity: ModelT) -> None:
        """Marca la entidad para borrado físico al confirmar la transacción."""
        self.session.delete(entity)
