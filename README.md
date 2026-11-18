# Food Store — TPI Programación IV

**Materia:** Programación IV · **Universidad:** Universidad Tecnológica Nacional (UTN)  
**Alumno:** Emanuel Aaron Brahim Pollini

[Guía del backend](backend/README.md) · [Guía del frontend](frontend/README.md)

Food Store es un sistema de catálogo y pedidos para un local de comidas. El TPI se desarrolla a partir del backend del TP9 y del frontend del TP10.

- **Backend.** Python, FastAPI, Pydantic y SQLModel sobre PostgreSQL.
- **Frontend.** React 19, TypeScript estricto, Vite, Tailwind CSS 4, Axios, TanStack Query, Form y Table, React Router y Zustand.

## Estado del proyecto

La infraestructura incluye configuración desde `.env`, una fábrica de sesiones y las clases compartidas `BaseRepository[T]` y `UnitOfWork`. La autenticación usa nombre de usuario, JWT en cookie HttpOnly y los roles `user` y `admin`.

El catálogo público permite buscar productos por nombre, filtrar por categoría y recorrer páginas consultadas al servidor. El botón **Agregar al carrito** guarda la selección al recargar. Los administradores pueden gestionar usuarios, categorías y productos, y actualizar stock y disponibilidad. Las bajas del catálogo son lógicas.

| Ruta | Acceso y funcionalidad |
|---|---|
| `/` | Público. Catálogo, búsqueda, filtro, paginación y agregado al carrito. |
| `/login`, `/register` | Público. Inicio de sesión y registro. |
| `/admin/categorias` | Admin. Alta, edición y baja lógica de categorías. |
| `/admin/productos` | Admin. Alta, edición, baja lógica y ajuste de stock y disponibilidad. |
| `/admin/usuarios` | Admin. Listado, activación y desactivación de cuentas. |

Quedan pendientes la página del carrito, el checkout, la adaptación de pedidos al TPI y el resumen administrativo.

## Estructura del repositorio

- `backend/app/core/` reúne la configuración, las sesiones y las clases compartidas de persistencia.
- `backend/app/modules/` contiene autenticación, usuarios, categorías, productos y el módulo heredado de pedidos.
- `backend/app/db/` contiene el seed. `backend/http/` reúne las solicitudes de REST Client.
- `frontend/src/` organiza la interfaz por funcionalidades y contiene las rutas, los componentes compartidos y los stores de Zustand.

## Requisitos

- **Python 3.11 a 3.13.** Los ejemplos usan Python 3.12 y el lanzador `py` de Windows.
- **PostgreSQL 15 o superior**, iniciado y accesible con un usuario local. Podés usar pgAdmin para crear la base.
- **Node.js 24 y pnpm 9 o superior.** Node.js 24 es la versión recomendada para cubrir los requisitos de Vite y ESLint del lockfile actual.

Los comandos están escritos para PowerShell. Usá una terminal para el backend y otra para el frontend.

## Instalación y ejecución del [backend](backend/README.md)

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

## Instalación y ejecución del [frontend](frontend/README.md)

### Paso 1. Abrir una segunda terminal · obligatorio

Dejá el backend en ejecución. Desde la raíz de `FoodStore_TPI_ProgramacionIV`, entrá a la carpeta del frontend.

```powershell
Set-Location .\frontend
```

### Paso 2. Instalar las dependencias · obligatorio

Desde `frontend/`, instalá las versiones registradas en `pnpm-lock.yaml`.

```powershell
pnpm install --frozen-lockfile
```

### Paso 3. Configurar la URL de la API · opcional en local

Desde `frontend/`, copiá el ejemplo si necesitás definir la URL. Con la configuración local predeterminada podés omitir este paso. Si ya existe `.env`, editalo y reiniciá Vite para aplicar el cambio.

```powershell
if (-not (Test-Path -LiteralPath .env)) { Copy-Item -LiteralPath .env.example -Destination .env }
```

`frontend/.env.example` contiene este valor. Conservá el sufijo `/api/v1` si cambiás el host o el puerto.

```dotenv
VITE_API_URL=http://localhost:8000/api/v1
```

### Paso 4. Comprobar la compilación · opcional para el arranque

Desde `frontend/`, verificá TypeScript y generá el build de producción. Esta comprobación forma parte de la entrega.

```powershell
pnpm build
```

### Paso 5. Iniciar Vite · obligatorio

Desde `frontend/`, iniciá el servidor de desarrollo.

```powershell
pnpm dev
```

Abrí [Food Store](http://localhost:5173) para recorrer el catálogo sin iniciar sesión. Para acceder al panel, entrá en `/login` e iniciá sesión con el usuario `admin` y la contraseña local de demostración `Admin1234!`. Usá `localhost` para los dos servidores. Si Vite muestra otro puerto, actualizá el origen autorizado en el backend y reiniciá la API. Si está definida `FRONTEND_ORIGINS`, actualizá esa lista. En caso contrario, editá `FRONTEND_ORIGIN`.

## Configuración que usa esta versión

| Variable | Uso |
|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL, en `backend/.env`. |
| `SECRET_KEY` | Clave local de al menos 32 bytes para firmar JWT, en `backend/.env`. |
| `ALGORITHM` | Algoritmo JWT de firma y validación. El ejemplo usa `HS256`. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración de la sesión. El ejemplo usa 30 minutos. |
| `FRONTEND_ORIGIN` | Origen del frontend autorizado para CORS. El ejemplo usa `http://localhost:5173`. |
| `FRONTEND_ORIGINS` | Lista heredada, separada por comas. Si está definida, tiene prioridad sobre `FRONTEND_ORIGIN`. |
| `COOKIE_SECURE` | Usá `false` para desarrollo local con HTTP y `true` con HTTPS. |
| `VITE_API_URL` | URL base de la API que consume Vite. El ejemplo usa `http://localhost:8000/api/v1`. Es opcional en el entorno local predeterminado. |

## Historial e hitos

- **`base-tp9-tp10`.** Base integrada de los dos trabajos prácticos.
- **Etapa 1 · Infraestructura (`tpi-infra`).** Configuración, fábrica de sesiones, repositorio y Unit of Work comunes, y documentación de arranque.
- **Etapa 2 · Autenticación y usuarios (`tpi-auth`).** Registro, inicio de sesión y administración de usuarios integrados con la interfaz.
- **Etapa 3 · Catálogo.** API, catálogo público, administración de categorías y productos y carga inicial con stock. Próximo hito `tpi-catalogo`.

El código está en el [repositorio público de Food Store](https://github.com/EmanuelABP/FoodStore_TPI_ProgramacionIV).

## Video de demostración

Enlace pendiente hasta que esté disponible el video definitivo.
