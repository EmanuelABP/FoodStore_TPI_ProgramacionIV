from fastapi import HTTPException

from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


def exigir_cuenta_activa(usuario: Usuario) -> None:
    if usuario.disabled:
        raise HTTPException(status_code=400, detail="Cuenta de usuario desactivada")


def listar() -> list[UserPublic]:
    with UsuarioUnitOfWork() as uow:
        return [UserPublic.model_validate(usuario) for usuario in uow.usuarios.get_all()]


def cambiar_estado(usuario_id: int, *, disabled: bool, admin_id: int) -> UserPublic:
    if disabled and usuario_id == admin_id:
        raise HTTPException(status_code=400, detail="No podés desactivar tu propia cuenta.")

    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.get_for_update(usuario_id)
        if usuario is None:
            raise HTTPException(status_code=404, detail="Usuario no encontrado.")

        usuario.disabled = disabled
        return UserPublic.model_validate(usuario)
