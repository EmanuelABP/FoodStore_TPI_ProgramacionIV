from typing import Annotated

from fastapi import APIRouter, Depends, Response
from sqlmodel import Session

from app.core.database import get_session
from app.core.deps import get_current_active_user, solo_admin
from app.ingrediente import service
from app.ingrediente.schema import IngredienteDatos, IngredienteRead

router = APIRouter(prefix="/ingredientes", tags=["Ingredientes"], dependencies=[Depends(get_current_active_user)])
Sesion = Annotated[Session, Depends(get_session)]


@router.get("", response_model=list[IngredienteRead])
def listar(session: Sesion):
    return service.listar(session)


@router.post("", response_model=IngredienteRead, status_code=201, dependencies=[Depends(solo_admin)])
def crear(datos: IngredienteDatos, session: Sesion):
    return service.crear(session, datos)


@router.put("/{ingrediente_id}", response_model=IngredienteRead, dependencies=[Depends(solo_admin)])
def actualizar(ingrediente_id: int, datos: IngredienteDatos, session: Sesion):
    return service.actualizar(session, ingrediente_id, datos)


@router.delete("/{ingrediente_id}", status_code=204, dependencies=[Depends(solo_admin)])
def eliminar(ingrediente_id: int, session: Sesion):
    service.eliminar(session, ingrediente_id)
    return Response(status_code=204)
