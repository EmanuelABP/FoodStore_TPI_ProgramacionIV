# Food Store — Backend

**Trabajo Práctico:** Unidad 9 — Estado global con Zustand y autenticación  
**Materia:** Programación IV  
**Alumno:** Emanuel Aaron Brahim Pollini

## Descripción

La API usa FastAPI, Pydantic, SQLModel y PostgreSQL. En `app/modules/usuarios/` separé los modelos, esquemas, repositorio, servicio y router. `UsuarioRol` vincula usuarios y roles y permite guardar el vencimiento de una asignación. Las contraseñas se guardan con bcrypt y las respuestas públicas devuelven los roles vigentes.

Al iniciar sesión, FastAPI firma un JWT y lo entrega mediante la cookie `access_token` con HttpOnly y SameSite=Lax. Las dependencias de `app/core/security.py` validan esa cookie, comprueban que la cuenta esté activa y consultan los roles en cada operación protegida. CORS admite credenciales desde los orígenes explícitos de `FRONTEND_ORIGINS`.

## Instalación y ejecución

Necesito Python 3.12 o superior y PostgreSQL. Desde pgAdmin 4 creo una base nueva llamada `foodstore_tp9`. Desde `backend/` ejecuto en PowerShell:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Copio `.env.example` solo la primera vez. En `.env` completo `DATABASE_URL` con la contraseña local de PostgreSQL y pego el valor generado en `SECRET_KEY`. Si mi contraseña de PostgreSQL contiene caracteres reservados, los codifico en la URL. El ejemplo usa `COOKIE_SECURE=false` para trabajar con HTTP en localhost. Para HTTPS uso `COOKIE_SECURE=true`. `ACCESS_TOKEN_EXPIRE_MINUTES` configura la vigencia del JWT.

```powershell
python seed.py --admin-email admin@foodstore.com
uvicorn app.main:app --reload
```

El seed crea las tablas que falten, carga los roles `admin` y `user`, los seis estados de pedido y las formas de pago. El argumento `--admin-email` crea una cuenta nueva y pide la contraseña en la terminal. Si ya existe ese email, uso otra cuenta o conservo el administrador que ya creé. Para cargar solo los catálogos ejecuto `python seed.py`. El registro público asigna el rol `user`.

La API queda en [localhost:8000](http://localhost:8000) y Swagger en [localhost:8000/docs](http://localhost:8000/docs). Para que la cookie se comparta entre la API y Vite, uso `localhost` en los dos.

## Rutas principales

| Método y ruta | Acceso y operación |
|---|---|
| POST `/api/v1/auth/register` | Público. Registra una cuenta con rol `user` y devuelve 201. |
| POST `/api/v1/auth/token` | Público. Usa formulario OAuth2 con el email en `username` y establece la cookie en la respuesta 204. |
| GET `/api/v1/auth/me` | Devuelve el perfil de la sesión y los roles vigentes. |
| POST `/api/v1/auth/logout` | Borra la cookie y devuelve 204. |
| GET `/api/v1/auth/admin/usuarios` | Admin. Lista usuarios activos y desactivados. |
| POST `/api/v1/auth/admin/usuarios/{id}/activar` y `/desactivar` | Admin. Actualiza `deleted_at` del usuario. |
| GET `/api/v1/roles`, `/api/v1/estados-pedido` y `/api/v1/formas-pago` | Catálogos de solo lectura para usuarios autenticados. |
| `/categorias/`, `/productos/`, `/ingredientes` | Lectura con sesión activa. Alta, edición y baja requieren admin. |
| GET y POST `/productos/{id}/categorias`, DELETE `/productos/{id}/categorias/{categoria_id}` | Lectura con sesión activa. El admin asigna y quita categorías. Al marcar otra principal, se reemplaza la anterior. |
| `/pedidos` y `/pedidos/{id}` | Lectura con sesión activa. El rol `user` o `admin` puede crear un pedido a su nombre. Edición y baja requieren admin. |

La falta de sesión responde 401, el rol insuficiente responde 403 y una cuenta desactivada responde 400. Los catálogos y Pedidos conservan sus bajas lógicas. Los listados normales excluyen bajas y la consulta de categorías con `incluir_inactivos=true` permite revisarlas. El listado administrativo de usuarios muestra su estado mediante `deleted_at`.

En los listados de productos y categorías puedo pedir páginas con `offset`, `limit` y `nombre`. Las asociaciones de ingredientes se guardan con `ingrediente_ids` y los productos devuelven sus categorías con el indicador `es_principal`.

## Pruebas con REST Client

Abro [auth.http](auth.http) y ejecuto las solicitudes en orden. Completo las credenciales de prueba en mi copia local y mantengo habilitada la conservación de cookies entre solicitudes. El bloque de login administrador se usa también al inicio de [productos.http](productos.http), [ingredientes.http](ingredientes.http) y [pedidos.http](pedidos.http). Si ya tengo datos de esas pruebas, uso una base de prueba separada para repetir las secuencias completas.
