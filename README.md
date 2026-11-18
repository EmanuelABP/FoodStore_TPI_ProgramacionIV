# Food Store — TPI Programación IV

**Materia:** Programación IV · **Universidad:** Universidad Tecnológica Nacional (UTN)  
**Alumno:** Emanuel Aaron Brahim Pollini

[Guía del backend](backend/README.md) · [Guía del frontend](frontend/README.md)

Food Store es un sistema de catálogo y pedidos para un local de comidas. El TPI se desarrolla a partir del backend del TP9 y del frontend del TP10.

- **Backend.** Python, FastAPI, Pydantic y SQLModel sobre PostgreSQL.
- **Frontend.** React, TypeScript, Vite, Tailwind, Axios, TanStack Query, Form y Table, React Router y Zustand.

## Estado del proyecto

La Etapa 1 incorporó `Settings`, la fábrica de sesiones, `BaseRepository[T]` y `UnitOfWork`. La Etapa 2 integró el modelo de usuario del TPI, el registro y el login por nombre de usuario, JWT en cookie HttpOnly y la gestión de cuentas con roles `user` y `admin`. La interfaz confirma la sesión con `/api/v1/auth/me` y habilita `/admin/usuarios` para administradores.

**Pendiente.** El catálogo vigente todavía requiere sesión y usa las rutas heredadas. Quedan para las próximas etapas el catálogo público, el stock, el carrito, el checkout y la gestión de pedidos del TPI.

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

Abrí [Food Store](http://localhost:5173) e iniciá sesión con el usuario `admin` y la contraseña local de demostración `Admin1234!`. Usá `localhost` para los dos servidores. Si Vite muestra otro puerto, agregá ese origen a la configuración CORS del backend y reiniciá la API. Si está definida `FRONTEND_ORIGINS`, actualizá esa lista. En caso contrario, editá `FRONTEND_ORIGIN`.

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

- **`base-tp9-tp10` · definitivo y existente.** Referencia de la base integrada de los dos trabajos prácticos.
- **Etapa 1 · Infraestructura.** Configuración, fábrica de sesiones, repositorio y Unit of Work comunes, y documentación de arranque. Tag publicado `tpi-infra`.
- **Etapa 2 · Autenticación y usuarios.** Contrato del TPI en backend y frontend. Próximo hito previsto `tpi-auth`.

Más detalles en el [README del backend](backend/README.md) y el [README del frontend](frontend/README.md). El código está en [FoodStore_TPI_ProgramacionIV](https://github.com/EmanuelABP/FoodStore_TPI_ProgramacionIV).