# Food Store — Backend del TPI de Programación IV

**Programación IV · UTN**  
**Alumno:** Emanuel Aaron Brahim Pollini

[README principal](../README.md) · [Guía del frontend](../frontend/README.md)

## Estado del backend

La API está desarrollada con FastAPI, Pydantic y SQLModel sobre PostgreSQL. `Settings` lee la configuración de `.env` y `session_factory()` abre las sesiones. Los módulos `auth`, `usuarios`, `categorias` y `productos` están adaptados al TPI.

En categorías y productos, el flujo es **Router → Service → Unit of Work → Repository → Model**. El router aplica permisos y traduce errores a respuestas HTTP. El servicio ejecuta las reglas de negocio dentro del Unit of Work, que comparte la sesión con los repositorios y confirma o revierte la transacción al salir. Los repositorios heredan de `BaseRepository[T]`. Los schemas separan la entrada y la salida de los modelos de tabla.

La autenticación tiene un rol singular `user` o `admin` y usa `disabled` para el estado de la cuenta. Passlib y bcrypt protegen las contraseñas. Python-jose firma el JWT y FastAPI lo entrega en la cookie `access_token` con HttpOnly y SameSite=Lax. CORS permite credenciales desde orígenes explícitos.

Cada producto pertenece a una categoría mediante `categoria_id`. La relación 1:N se define con `Categoria.productos` y `Producto.categoria`. Categorías y productos se dan de baja con `activo=false`. Una categoría inactiva se excluye del listado de categorías y conserva tanto su nombre como las relaciones con sus productos. Los productos activos de esa categoría siguen apareciendo en el catálogo público.

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

### Paso 5. Preparar PostgreSQL y crear una base vacía · obligatorio

Si todavía no tenés PostgreSQL, descargá el [instalador oficial para Windows](https://www.postgresql.org/download/windows/) e instalá el servidor y pgAdmin. Durante la instalación, definí la contraseña local del usuario `postgres` y anotá el puerto elegido, que por defecto es `5432`.

Con el servicio iniciado, abrí pgAdmin y conectate al servidor local con ese usuario. Sobre **Databases**, elegí **Create → Database**, poné `foodstore_tpi` como nombre y seleccioná como propietario el usuario que va a usar la API. Si ya existe una base con ese nombre, elegí otro y usalo en `DATABASE_URL`. El seed crea las tablas faltantes en la base vacía. Para esta instalación usá una base nueva, porque las tablas de versiones anteriores requieren otro esquema.

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

Desde `backend/`, con el entorno virtual activo, ejecutá el seed para crear las tablas y cargar el administrador de demostración, tres categorías y ocho productos con stock inicial.

```powershell
python -m app.db.seed
```

El administrador tiene **usuario `admin`**, **contraseña `Admin1234!`** y **rol `admin`**. Estas credenciales son exclusivamente para demostraciones locales. El registro público crea cuentas con rol `user`.

Podés volver a ejecutar el seed sobre la misma base para repetir la carga sin duplicar los datos de demostración.

### Paso 9. Iniciar la API · obligatorio

Desde `backend/`, con el entorno activo, iniciá Uvicorn. La opción `--reload` reinicia el servidor cuando editás el código.

```powershell
uvicorn app.main:app --reload
```

Si PowerShell no encuentra el ejecutable, desde `backend/` y con el entorno activo, invocá Uvicorn mediante Python.

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

### Categorías

| Método y ruta | Acceso y respuesta |
|---|---|
| GET `/api/v1/categorias` | Público. Devuelve 200 con las categorías activas. |
| GET `/api/v1/categorias/{id}` | Público. Devuelve 200 o 404 si la categoría no existe o está inactiva. |
| POST `/api/v1/categorias` | Admin. Devuelve 201 o 409 si el nombre ya existe, incluso si la categoría está inactiva. |
| PUT `/api/v1/categorias/{id}` | Admin. Actualiza los campos enviados. Devuelve 200, 404 o 409 por nombre duplicado. |
| DELETE `/api/v1/categorias/{id}` | Admin. Baja lógica con 204. Devuelve 404 si la categoría ya está inactiva o no existe. |

El nombre de la categoría debe tener de 2 a 100 caracteres. La descripción es opcional.

### Productos

| Método y ruta | Acceso y respuesta |
|---|---|
| GET `/api/v1/productos` | Público. Devuelve 200 con `total` e `items`. |
| GET `/api/v1/productos/{id}` | Público. Devuelve 200 o 404 si el producto no existe o está inactivo. |
| POST `/api/v1/productos` | Admin. Devuelve 201 o 404 si la categoría indicada no existe o está inactiva. |
| PUT `/api/v1/productos/{id}` | Admin. Actualiza los campos enviados. Devuelve 200 o 404 si el producto no está activo o la categoría indicada no es válida. |
| PATCH `/api/v1/productos/{id}/stock` | Admin. Recibe `stock` y `disponible`. Devuelve 200 o 404 si el producto no existe o está inactivo. |
| DELETE `/api/v1/productos/{id}` | Admin. Baja lógica con 204. Devuelve 404 si el producto ya está inactivo o no existe. |

El listado devuelve productos activos e incluye su categoría en `categoria`. Admite `skip` (0 por defecto), `limit` (20 por defecto y 100 como máximo), `search` (nombre sin distinguir mayúsculas), `categoria_id` y `disponible`. El total cuenta todos los resultados filtrados antes de paginar.

El producto requiere nombre, precio base mayor o igual a cero y una categoría activa al crearlo o reasignarlo. El stock es entero y mayor o igual a cero. La descripción y la URL de imagen son opcionales. Las entradas inválidas devuelven 422. En operaciones administrativas, una sesión inválida devuelve 401, una cuenta desactivada devuelve 400 y un rol insuficiente devuelve 403.

### Pedidos heredados

El backend todavía registra `/pedidos` y `/pedidos/{pedido_id}` con el contrato heredado. Los catálogos autenticados de solo lectura `/api/v1/estados-pedido` y `/api/v1/formas-pago` acompañan ese módulo, y el seed conserva sus datos auxiliares. Las rutas definitivas, las reglas RN-01 a RN-06, la gestión transaccional de stock y el resumen de pedidos quedan pendientes.

## Pruebas con REST Client

Con la API iniciada, abrí [auth.http](http/auth.http), [categorias.http](http/categorias.http) o [productos.http](http/productos.http) en VS Code con la extensión REST Client. Ejecutá cada secuencia en orden con **Send Request** y mantené habilitadas las cookies. Usá una base de prueba. Para repetir las altas de catálogo, cambiá `@lote` en el archivo correspondiente.

[pedidos.http](http/pedidos.http) queda como referencia del módulo heredado. Sus solicitudes de login y preparación del catálogo usan contratos anteriores. La secuencia se actualizará con la adaptación de pedidos.
