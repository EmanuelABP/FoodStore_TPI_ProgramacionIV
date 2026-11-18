# Food Store — Backend del TPI de Programación IV

**Programación IV · UTN**  
**Alumno:** Emanuel Aaron Brahim Pollini

[README principal](../README.md) · [Guía del frontend](../frontend/README.md)

## Estado del backend

La API usa FastAPI, Pydantic, SQLModel y PostgreSQL. En esta etapa se incorporaron `Settings` para leer `.env`, `session_factory()` para abrir sesiones y las clases compartidas `BaseRepository[T]` y `UnitOfWork`. La integración de estas clases con los módulos del TPI se hará por etapas. El módulo de pedidos conserva su Unit of Work propio.

La autenticación usa el modelo Usuario del TPI, con un rol singular `user` o `admin` y el campo `disabled` para el estado de la cuenta. El login recibe el nombre de usuario. Passlib y bcrypt protegen las contraseñas. Python-jose firma el JWT y FastAPI lo entrega en la cookie `access_token` con HttpOnly y SameSite=Lax. CORS permite credenciales desde orígenes explícitos.

Categorías, productos, ingredientes y pedidos mantienen las operaciones heredadas mientras avanza su adaptación. El catálogo público, el stock y el flujo definitivo de pedidos siguen pendientes.

## Instalación y ejecución en Windows

Usá Python 3.11 a 3.13 y PostgreSQL 15 o superior. La guía usa Python 3.12 y PowerShell.

### Paso 1. Entrar a la carpeta del backend · obligatorio

Desde la raíz de `FoodStore_TPI_ProgramacionIV`, entrá a la carpeta del backend.

```powershell
Set-Location .\backend
```

### Paso 2. Crear el entorno virtual · obligatorio

Desde `backend/`, creá el entorno virtual para aislar las dependencias del proyecto.

```powershell
py -3.12 -m venv .venv
```

### Paso 3. Activar el entorno virtual · obligatorio

Desde `backend/`, activá el entorno virtual de Python en la terminal actual.

```powershell
.\.venv\Scripts\Activate.ps1
```

### Paso 4. Instalar las dependencias · obligatorio

Desde `backend/`, con el entorno activo, instalá los paquetes que usa la API.

```powershell
python -m pip install -r requirements.txt
```

### Paso 5. Crear la base en PostgreSQL · obligatorio

Con PostgreSQL iniciado, creá una base local nueva llamada `foodstore_tpi`. Si ya usaste ese nombre con el esquema del TP9, creá otra base y usá su nombre en `DATABASE_URL`. El arranque y el seed crean tablas faltantes, pero requieren un esquema compatible. En pgAdmin podés hacerlo desde el menú contextual de **Databases → Create → Database**. Usá como propietario el usuario con el que se conectará la API.

### Paso 6. Configurar el archivo `.env` · obligatorio

Desde `backend/`, copiá el ejemplo si todavía no tenés un archivo `.env`. Si ya existe, editá ese archivo.

```powershell
if (-not (Test-Path -LiteralPath .env)) { Copy-Item -LiteralPath .env.example -Destination .env }
```

Abrí `backend/.env` y completá `DATABASE_URL` con el usuario, la contraseña, el host, el puerto y el nombre de tu base. Este ejemplo usa una contraseña ficticia.

```dotenv
DATABASE_URL=postgresql+psycopg2://postgres:CLAVE_FICTICIA@localhost:5432/foodstore_tpi
```

Si la contraseña contiene caracteres reservados como `@` o `#`, codificalos para URL en el valor de la conexión. Mantené `FRONTEND_ORIGIN=http://localhost:5173` y `COOKIE_SECURE=false` para el desarrollo local por HTTP.

### Paso 7. Generar la clave de sesión · obligatorio

Desde `backend/`, con el entorno activo, generá una clave aleatoria para firmar los tokens.

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Pegá el valor generado en `SECRET_KEY` dentro de `backend/.env`. La aplicación exige al menos 32 bytes y rechaza el marcador del ejemplo. Guardá la clave y la contraseña de PostgreSQL en tu copia local de `.env`, que se excluye de Git.

### Paso 8. Ejecutar el seed · obligatorio en una base nueva

Desde `backend/`, con el entorno virtual activo, prepará el administrador de demostración y los catálogos auxiliares del módulo de pedidos heredado.

```powershell
python -m app.db.seed
```

El administrador tiene **usuario `admin`**, **contraseña `Admin1234!`** y **rol `admin`**. Estas credenciales son exclusivamente para demostraciones locales. El registro público crea cuentas con rol `user`.

El seed se puede volver a ejecutar sin duplicar el administrador. Queda pendiente cargar las tres categorías y los ocho productos con stock exigidos por CE-04.

### Paso 9. Iniciar la API · obligatorio

Desde `backend/`, con el entorno activo, iniciá Uvicorn. La opción `--reload` reinicia el servidor cuando editás el código.

```powershell
python -m uvicorn app.main:app --reload
```

Dejá la terminal abierta y entrá en [Swagger](http://localhost:8000/docs) para consultar y probar las rutas.

## Detalles de configuración

`Settings` lee `backend/.env` mediante la ruta del proyecto. Las variables del entorno del proceso tienen prioridad sobre el archivo. La lista heredada `FRONTEND_ORIGINS`, cuando está definida, tiene prioridad sobre el origen singular `FRONTEND_ORIGIN`. Para usar solamente el origen singular, dejá la lista heredada sin definir.

`ACCESS_TOKEN_EXPIRE_MINUTES` define la vigencia del token y la cookie. `ALGORITHM` selecciona el algoritmo de firma y validación JWT. El ejemplo usa `HS256`. Para HTTPS usá `COOKIE_SECURE=true`. En local, usá el mismo host `localhost` en FastAPI y Vite para que el navegador envíe la cookie de sesión.

Para ejecutar la interfaz junto a la API, seguí la [guía del frontend](../frontend/README.md).

## Rutas principales

| Método y ruta | Acceso y respuesta |
|---|---|
| POST `/api/v1/auth/register` | Público. Recibe `username`, `full_name`, `email` y `password`. Crea un `user` y devuelve 201 con `UserPublic`, 409 por usuario o email duplicado y 422 por datos inválidos. |
| POST `/api/v1/auth/token` | Público. Formulario OAuth2 con `username` y `password`. Devuelve 200 con `{"message": "Login exitoso"}` y establece la cookie. Credenciales incorrectas devuelven 401 y una cuenta desactivada devuelve 400. |
| GET `/api/v1/auth/me` | Devuelve 200 y `UserPublic` con sesión vigente. Sin sesión válida devuelve 401 y con cuenta desactivada, 400. |
| POST `/api/v1/auth/logout` | Público. Devuelve 200 y elimina la cookie. |
| GET `/api/v1/admin/usuarios` | Admin. Devuelve 200 con usuarios activos y desactivados. |
| POST `/api/v1/admin/usuarios/{id}/activar` | Admin. Establece `disabled=false`. Devuelve 200 incluso si ya está activo y 404 si el usuario no existe. |
| POST `/api/v1/admin/usuarios/{id}/desactivar` | Admin. Establece `disabled=true`. Devuelve 200 incluso si ya está desactivado, 404 si no existe y 400 si un administrador intenta desactivar su propia cuenta. |

Las operaciones administrativas responden 403 si el usuario carece del rol `admin`. El perfil incluye `id`, `username`, `full_name`, `email`, `role`, `disabled` y `created_at`. El hash de contraseña queda en la base y el JWT viaja en la cookie HttpOnly.

### Rutas heredadas

| Método y ruta | Acceso y operación |
|---|---|
| GET `/api/v1/estados-pedido` y `/api/v1/formas-pago` | Catálogos de solo lectura para usuarios autenticados. |
| `/categorias/`, `/productos/`, `/ingredientes` | Lectura con sesión activa. Alta, edición y baja requieren admin. |
| GET y POST `/productos/{id}/categorias`, DELETE `/productos/{id}/categorias/{categoria_id}` | Lectura con sesión activa. El admin asigna y quita categorías. Al marcar otra principal, se reemplaza la anterior. |
| `/pedidos` y `/pedidos/{id}` | Lectura con sesión activa. El rol `user` o `admin` puede crear un pedido a su nombre. Edición y baja requieren admin. |

La falta de sesión responde 401, el rol insuficiente responde 403 y una cuenta desactivada responde 400. Los catálogos y Pedidos conservan sus bajas lógicas. Los listados normales excluyen bajas y el rol `admin` puede consultar categorías dadas de baja con `incluir_inactivos=true`.

En los listados de productos y categorías puedo pedir páginas con `offset`, `limit` y `nombre`. Las asociaciones de ingredientes se guardan con `ingrediente_ids` y los productos devuelven sus categorías con el indicador `es_principal`.

## Pruebas con REST Client

Con la API iniciada, abrí [auth.http](http/auth.http) en VS Code con la extensión REST Client. Completá las credenciales de prueba en tu copia local y ejecutá las solicitudes en orden con **Send Request**. Mantené habilitado el envío de cookies entre solicitudes.

Los guiones de [productos](http/productos.http), [ingredientes](http/ingredientes.http) y [pedidos](http/pedidos.http) conservan ejemplos de las operaciones de esos módulos. Sus bloques de login corresponden a la etapa anterior. Omití esos bloques y usá el login de `auth.http` en la misma sesión de REST Client. Para repetir una secuencia completa, usá una base de pruebas separada.