from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exception_handlers import request_validation_exception_handler
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from app.core.config import FRONTEND_ORIGINS, TOKEN_MINUTES, secret_key
from app.modules.auth.router import router as auth_router
from app.modules.usuarios.router import router as usuarios_router
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import crear_tablas
from app.modules.categorias.router import router as categoria_router
from app.modules.pedidos.router import router as pedido_router
from app.modules.productos.router import router as producto_router


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
        "Universitaria en Programación de la UTN. Autenticación, usuarios, categorías "
        "y productos están adaptados al TPI. El módulo de pedidos implementa "
        "las reglas RN-01 a RN-06, con gestión transaccional de stock y "
        "cancelaciones. La API usa FastAPI y SQLModel sobre PostgreSQL."
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


app.include_router(auth_router, prefix="/api/v1")
app.include_router(usuarios_router, prefix="/api/v1")
# Registrar los endpoints
app.include_router(categoria_router, prefix="/api/v1")
app.include_router(producto_router, prefix="/api/v1")
app.include_router(pedido_router, prefix="/api/v1")
