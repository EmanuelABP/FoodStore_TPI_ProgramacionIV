from fastapi import HTTPException
from sqlalchemy import Index, text
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session

NOMBRE_NORMALIZADO = "lower(btrim(regexp_replace(nombre, '[[:space:]]+', ' ', 'g')))"


def indice_nombre_activo(tabla: str) -> Index:
    return Index(
        f"uq_{tabla}_nombre_activo",
        text(NOMBRE_NORMALIZADO),
        unique=True,
        postgresql_where=text("deleted_at IS NULL"),
    )


def confirmar_nombre(session: Session, tabla: str, entidad: str) -> None:
    try:
        session.commit()
    except IntegrityError as error:
        session.rollback()
        if getattr(getattr(error.orig, "diag", None), "constraint_name", None) == f"uq_{tabla}_nombre_activo":
            raise HTTPException(status_code=409, detail=f"Ya existe {entidad} con ese nombre.") from error
        raise
