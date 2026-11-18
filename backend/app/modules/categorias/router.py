from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response

from app.core.deps import solo_admin
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import CategoriaNoEncontrada, CategoriaService, NombreDuplicado
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork

router = APIRouter(prefix="/categorias", tags=["Categorías"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


Servicio = Annotated[CategoriaService, Depends(get_categoria_service)]


@router.get("", response_model=list[CategoriaRead])
def listar(servicio: Servicio) -> list[CategoriaRead]:
    return servicio.listar()


@router.get("/{id}", response_model=CategoriaRead)
def obtener(id: int, servicio: Servicio) -> CategoriaRead:
    try:
        return servicio.obtener(id)
    except CategoriaNoEncontrada as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.post("", response_model=CategoriaRead, status_code=201, dependencies=[Depends(solo_admin)])
def crear(datos: CategoriaCreate, servicio: Servicio) -> CategoriaRead:
    try:
        return servicio.crear(datos)
    except NombreDuplicado as error:
        raise HTTPException(status_code=409, detail=str(error)) from error


@router.put("/{id}", response_model=CategoriaRead, dependencies=[Depends(solo_admin)])
def actualizar(id: int, datos: CategoriaUpdate, servicio: Servicio) -> CategoriaRead:
    try:
        return servicio.actualizar(id, datos)
    except CategoriaNoEncontrada as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except NombreDuplicado as error:
        raise HTTPException(status_code=409, detail=str(error)) from error


@router.delete("/{id}", status_code=204, dependencies=[Depends(solo_admin)])
def eliminar(id: int, servicio: Servicio) -> Response:
    try:
        servicio.eliminar(id)
    except CategoriaNoEncontrada as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    return Response(status_code=204)
