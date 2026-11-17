# Food Store — Backend del TPI de Programación IV

**Programación IV · UTN**  
**Alumno:** Emanuel Aaron Brahim Pollini

[README principal](../README.md) · [Guía del frontend](../frontend/README.md)

## Estado del backend

La API usa FastAPI, Pydantic, SQLModel y PostgreSQL. En esta etapa se incorporaron `Settings` para leer `.env`, `session_factory()` para abrir sesiones y las clases compartidas `BaseRepository[T]` y `UnitOfWork`. La integración de estas clases con los módulos del TPI se hará por etapas. El módulo de pedidos conserva su Unit of Work propio.

La API mantiene los contratos del TP9 que consume el frontend del TP10. En `app/modules/usuarios/`, `UsuarioRol` vincula usuarios y roles vigentes. Las contraseñas se guardan con bcrypt. El JWT viaja en la cookie `access_token` con HttpOnly y SameSite=Lax. CORS permite credenciales desde orígenes explícitos.

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

Con PostgreSQL iniciado, creá una base local llamada `foodstore_tpi`. En pgAdmin podés hacerlo desde el menú contextual de **Databases → Create → Database**. Usá como propietario el usuario con el que se conectará la API.

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

### Paso 8. Cargar catálogos y preparar el administrador de prueba · obligatorio en una base nueva

Desde `backend/`, ejecutá el seed heredado del TP9. Crea las tablas que falten, carga los roles, los estados de pedido y las formas de pago, y crea una cuenta administradora. Ingresá una contraseña propia de al menos ocho caracteres cuando el programa la pida.

```powershell
python seed.py --admin-email admin@foodstore.com
```

Para iniciar sesión como administrador de prueba, usá **`admin@foodstore.com`** y **la contraseña que elegiste al ejecutar el seed**. Si el email ya existe, usá la cuenta existente o elegí otro al crear una nueva. El registro público crea cuentas con rol `user`.

Si ya disponés de una cuenta administradora y solo necesitás cargar los catálogos, desde `backend/` usá esta alternativa.

```powershell
python seed.py
```

### Paso 9. Iniciar la API · obligatorio

Desde `backend/`, con el entorno activo, iniciá Uvicorn. La opción `--reload` reinicia el servidor cuando editás el código.

```powershell
python -m uvicorn app.main:app --reload
```

Dejá la terminal abierta y entrá en [Swagger](http://localhost:8000/docs) para consultar y probar las rutas.

## Detalles de configuración

`Settings` lee `backend/.env` mediante la ruta del proyecto. Las variables del entorno del proceso tienen prioridad sobre el archivo. La lista heredada `FRONTEND_ORIGINS`, cuando está definida, tiene prioridad sobre el origen singular `FRONTEND_ORIGIN`. Para usar solamente el origen singular, dejá la lista heredada sin definir.

`ACCESS_TOKEN_EXPIRE_MINUTES` define la vigencia del token y la cookie. `ALGORITHM` está disponible en la configuración del TPI. En esta etapa, la autenticación heredada sigue firmando y validando con `HS256`. Para HTTPS usá `COOKIE_SECURE=true`. En local, usá el mismo host `localhost` en FastAPI y Vite para que el navegador envíe la cookie de sesión.

El seed conserva los catálogos del TP9. El administrador se crea con el email que pases por parámetro y una contraseña ingresada en la terminal. Si el email ya existe, conservá la cuenta o elegí otro email para un nuevo administrador.

Para ejecutar la interfaz junto a la API, seguí la [guía del frontend](../frontend/README.md).

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

La falta de sesión responde 401, el rol insuficiente responde 403 y una cuenta desactivada responde 400. Los catálogos y Pedidos conservan sus bajas lógicas. Los listados normales excluyen bajas y el rol `admin` puede consultar categorías dadas de baja con `incluir_inactivos=true`. El listado administrativo de usuarios muestra su estado mediante `deleted_at`.

En los listados de productos y categorías puedo pedir páginas con `offset`, `limit` y `nombre`. Las asociaciones de ingredientes se guardan con `ingrediente_ids` y los productos devuelven sus categorías con el indicador `es_principal`.

## Pruebas con REST Client

Con la API iniciada, abrí [auth.http](http/auth.http) en VS Code con la extensión REST Client. Completá las credenciales de prueba en tu copia local y ejecutá las solicitudes en orden con **Send Request**. Mantené habilitado el envío de cookies entre solicitudes.

Para probar los demás módulos, abrí [productos.http](http/productos.http), [ingredientes.http](http/ingredientes.http) o [pedidos.http](http/pedidos.http). Ejecutá primero el bloque de inicio de sesión del administrador en el archivo elegido. Si querés repetir una secuencia completa, usá una base de pruebas separada.
