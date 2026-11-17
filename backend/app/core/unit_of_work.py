from types import TracebackType
from typing import Self

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    def __init__(self) -> None:
        self._session: Session | None = None

    @property
    def session(self) -> Session:
        if self._session is None:
            raise RuntimeError("La sesión del Unit of Work solo está disponible dentro del bloque with.")
        return self._session

    def __enter__(self) -> Self:
        if self._session is not None:
            raise RuntimeError("Este Unit of Work ya tiene una sesión activa.")
        self._session = session_factory()
        return self

    def __exit__(
        self,
        error_type: type[BaseException] | None,
        error: BaseException | None,
        traceback: TracebackType | None,
    ) -> None:
        session = self.session
        try:
            if error is not None:
                self._rollback_and_close(session, error)
                return

            try:
                session.commit()
            except BaseException as commit_error:
                self._rollback_and_close(session, commit_error)
                raise
            else:
                session.close()
        finally:
            self._session = None

    @staticmethod
    def _rollback_and_close(session: Session, original_error: BaseException) -> None:
        try:
            session.rollback()
        except BaseException as rollback_error:
            original_error.add_note(f"También falló el rollback ({type(rollback_error).__name__}).")
        finally:
            try:
                session.close()
            except BaseException as close_error:
                original_error.add_note(f"También falló el cierre de la sesión ({type(close_error).__name__}).")
