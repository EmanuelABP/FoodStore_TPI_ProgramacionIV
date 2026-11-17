from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exception_handlers import request_validation_exception_handler
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from app.core.config import FRONTEND_ORIGINS, TOKEN_MINUTES, secret_key
from app.core.catalogos_router import router as catalogos_router
from app.modules.usuarios.router import router as auth_router
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import crear_tablas
from app.categoria.router import router as categoria_router
from app.ingrediente.router import router as ingrediente_router
from app.modules.pedidos.router import router as pedido_router
from app.producto.router import router as producto_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    secret_key()
    if TOKEN_MINUTES <= 0 or not FRONTEND_ORIGINS or "*" in FRONTEND_ORIGINS:
        raise RuntimeError("Configurá una duración positiva y orígenes CORS explícitos.")
    crear_tablas()
    yield


app = FastAPI(
    title="Food Store - TPI Programación IV",
    description=(
        "API REST de Food Store para el Trabajo Práctico Integrador de Programación IV. "
        "Desarrollado por Emanuel Aaron Brahim Pollini, estudiante de la Tecnicatura "
        "Universitaria en Programación de la UTN. Durante el desarrollo del TPI, "
        "conserva los módulos heredados del TP9 de autenticación, catálogo y pedidos."
    ),
    version="1.0.0",
    lifespan=lifespan,
)


# Permitir la comunicación con el frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(FRONTEND_ORIGINS),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic incluye el valor rechazado. En autenticación puede ser una contraseña.
@app.exception_handler(RequestValidationError)
async def error_validacion(request: Request, error: RequestValidationError):
    if request.url.path in {"/api/v1/auth/register", "/api/v1/auth/token"}:
        detalle = [{clave: item[clave] for clave in ("loc", "type", "msg")} for item in error.errors()]
        return JSONResponse(status_code=422, content={"detail": detalle})
    return await request_validation_exception_handler(request, error)


app.include_router(auth_router)
app.include_router(catalogos_router)
# Registrar los endpoints
app.include_router(categoria_router)
app.include_router(producto_router)
app.include_router(ingrediente_router)
app.include_router(pedido_router)
