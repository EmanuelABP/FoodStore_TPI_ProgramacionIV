from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.deps import solo_admin
from app.modules.usuarios import service
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/admin/usuarios", tags=["Administración de usuarios"])
Administrador = Annotated[Usuario, Depends(solo_admin)]


@router.get("", response_model=list[UserPublic], dependencies=[Depends(solo_admin)])
def listar_usuarios() -> list[UserPublic]:
    return service.listar()


@router.post("/{id}/activar", response_model=UserPublic)
def activar(id: int, admin: Administrador) -> UserPublic:
    assert admin.id is not None
    return service.cambiar_estado(id, disabled=False, admin_id=admin.id)


@router.post("/{id}/desactivar", response_model=UserPublic)
def desactivar(id: int, admin: Administrador) -> UserPublic:
    assert admin.id is not None
    return service.cambiar_estado(id, disabled=True, admin_id=admin.id)
