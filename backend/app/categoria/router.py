
from fastapi import APIRouter, Depends, Query, Response, status
from sqlmodel import Session

from app.core.database import get_session
from app.core.security import UsuarioActivo, get_current_active_user, solo_admin
from app.categoria.schema import (
    CategoriaCreate,
    CategoriaUpdate,
    CategoriaRead,
    CategoriaPaginatedResponse,
)
from app.categoria import service


router = APIRouter(
    prefix="/categorias",
    dependencies=[Depends(get_current_active_user)],
    tags=["Categorías"],
)


@router.get("/", response_model=list[CategoriaRead] | CategoriaPaginatedResponse)
def listar_categorias(
    usuario: UsuarioActivo,
    session: Session = Depends(get_session),
    offset: int | None = Query(default=None, ge=0),
    limit: int | None = Query(default=None, ge=1, le=100),
    nombre: str | None = None,
    incluir_inactivos: bool = False,
):
    if incluir_inactivos:
        solo_admin(usuario, session)
    return service.listar_categorias(
        session, offset=offset, limit=limit, nombre=nombre, incluir_inactivos=incluir_inactivos,
    )


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(
    categoria_id: int,
    session: Session = Depends(get_session),
):
    return service.obtener_categoria(session, categoria_id)


@router.post(
    "/",
    response_model=CategoriaRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(solo_admin)],
)
def crear_categoria(
    datos: CategoriaCreate,
    session: Session = Depends(get_session),
):
    return service.crear_categoria(session, datos)


@router.put("/{categoria_id}", response_model=CategoriaRead, dependencies=[Depends(solo_admin)])
def actualizar_categoria(
    categoria_id: int,
    datos: CategoriaUpdate,
    session: Session = Depends(get_session),
):
    return service.actualizar_categoria(session, categoria_id, datos)


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(solo_admin)])
def eliminar_categoria(
    categoria_id: int,
    session: Session = Depends(get_session),
):
    service.eliminar_categoria(session, categoria_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
