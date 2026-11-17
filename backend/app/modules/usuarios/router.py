from typing import Annotated

from fastapi import APIRouter, Depends, Response
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import COOKIE_SECURE, TOKEN_MINUTES
from app.core.security import Sesion, UsuarioActivo, crear_token, solo_admin, verificar_origen
from app.modules.usuarios import service
from app.modules.usuarios.schemas import UserCreate, UserPublic

router = APIRouter(prefix="/api/v1/auth", tags=["Autenticación"])
admin = APIRouter(prefix="/admin/usuarios", dependencies=[Depends(solo_admin)])


@router.post("/register", response_model=UserPublic, status_code=201)
def registrar(datos: UserCreate, session: Sesion):
    return service.registrar(session, datos)


@router.post("/token", status_code=204, dependencies=[Depends(verificar_origen)])
def token(form: Annotated[OAuth2PasswordRequestForm, Depends()], session: Sesion):
    usuario = service.autenticar(session, form.username, form.password)
    assert usuario.id is not None
    respuesta = Response(status_code=204)
    respuesta.set_cookie(
        "access_token", crear_token(usuario.id), httponly=True, secure=COOKIE_SECURE,
        samesite="lax", path="/", max_age=TOKEN_MINUTES * 60,
    )
    return respuesta


@router.post("/logout", status_code=204, dependencies=[Depends(verificar_origen)])
def logout():
    respuesta = Response(status_code=204)
    respuesta.delete_cookie("access_token", path="/", httponly=True, secure=COOKIE_SECURE, samesite="lax")
    return respuesta


@router.get("/me", response_model=UserPublic)
def me(usuario: UsuarioActivo, session: Sesion):
    return service.publico(session, usuario)


@admin.get("", response_model=list[UserPublic])
def listar_usuarios(session: Sesion):
    return service.listar(session)


@admin.post("/{usuario_id}/activar", response_model=UserPublic)
def activar(usuario_id: int, session: Sesion):
    return service.cambiar_estado(session, usuario_id, activo=True)


@admin.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar(usuario_id: int, session: Sesion):
    return service.cambiar_estado(session, usuario_id, activo=False)


router.include_router(admin)
