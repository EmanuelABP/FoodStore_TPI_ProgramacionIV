from typing import Annotated

from fastapi import APIRouter, Depends, Response
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import COOKIE_SECURE, TOKEN_MINUTES
from app.core.deps import Sesion, UsuarioActivo, verificar_origen
from app.core.security import create_access_token
from app.modules.auth import service
from app.modules.auth.schemas import UserCreate
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/register", response_model=UserPublic, status_code=201)
def registrar(datos: UserCreate) -> UserPublic:
    return service.registrar(datos)


@router.post("/token", status_code=200, dependencies=[Depends(verificar_origen)])
def token(
    response: Response,
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Sesion,
) -> dict[str, str]:
    usuario = service.autenticar(session, form.username, form.password)
    assert usuario.id is not None
    response.set_cookie(
        "access_token", create_access_token(usuario.id), httponly=True, secure=COOKIE_SECURE,
        samesite="lax", path="/", max_age=TOKEN_MINUTES * 60,
    )
    return {"message": "Login exitoso"}


@router.post("/logout", status_code=200, dependencies=[Depends(verificar_origen)])
def logout() -> Response:
    response = Response(status_code=200)
    response.delete_cookie("access_token", path="/", httponly=True, secure=COOKIE_SECURE, samesite="lax")
    return response


@router.get("/me", response_model=UserPublic)
def me(usuario: UsuarioActivo) -> UserPublic:
    return UserPublic.model_validate(usuario)
