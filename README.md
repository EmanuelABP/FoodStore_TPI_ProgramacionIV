# Food Store — TPI Programación IV

**Materia:** Programación IV · **Universidad:** Universidad Tecnológica Nacional (UTN)  
**Alumno:** Emanuel Aaron Brahim Pollini

[Guía del backend](backend/README.md) · [Guía del frontend](frontend/README.md)

Food Store es una tienda de comidas con catálogo público, carrito y pedidos. Los clientes pueden comprar y consultar sus pedidos. El panel de administración permite gestionar el catálogo, el stock, los usuarios y los pedidos.

- **Backend.** Python, FastAPI, Pydantic y SQLModel sobre PostgreSQL. Usa JWT en cookie HttpOnly.
- **Frontend.** React 19, TypeScript estricto, Vite, Tailwind CSS 4, Axios, TanStack Query, Form y Table, React Router y Zustand.

## Rutas y permisos

| Ruta | Acceso y funcionalidad |
|---|---|
| `/` | Público. Catálogo con búsqueda, filtro por categoría, paginación y agregado al carrito. |
| `/login`, `/register` | Público. Inicio de sesión por nombre de usuario y registro. |
| `/carrito` | Público. Cantidades, subtotales y total. El carrito se guarda en el navegador. |
| `/checkout` | Sesión activa. Confirmación del pedido con datos de entrega y pago. |
| `/mis-pedidos` | Sesión activa. Pedidos propios, detalle y cancelación en estado pendiente. |
| `/admin/categorias` | Admin. Alta, edición y baja lógica de categorías. |
| `/admin/productos` | Admin. Alta, edición, baja lógica y ajuste de stock y disponibilidad. |
| `/admin/usuarios` | Admin. Listado, activación y desactivación de cuentas. |
| `/admin/pedidos` | Admin. Listado, filtros, detalle y cambios de estado. |
| `/admin/resumen` | Admin. Conteos por estado, pedidos del día e ingresos de pedidos entregados. |
| `/unauthorized` | Público. Aviso de acceso denegado. |

El recorrido de compra es **Catálogo → Carrito → Inicio de sesión, si hace falta → Checkout → Mis pedidos**. El carrito se conserva al recargar y al iniciar sesión. Se vacía cuando la API confirma el pedido.

### Pedidos, stock y cancelación

Al confirmar, el backend valida que cada producto esté activo, disponible y tenga stock suficiente. El pedido nace en `PENDIENTE`. El alta y el descuento de stock ocurren en una sola transacción. Las líneas guardan el nombre y el precio del producto en el momento de la compra, y el total queda fijo. Los medios de pago disponibles son `EFECTIVO` y `TRANSFERENCIA`.

Un cliente puede cancelar un pedido propio en `PENDIENTE`. El administrador puede avanzar de `PENDIENTE` a `EN_PREPARACION` y luego a `ENTREGADO`, o pasar desde cualquiera de los dos estados anteriores a `CANCELADO`. La cancelación repone el stock en la misma transacción. `ENTREGADO` y `CANCELADO` son estados terminales. Los pedidos se conservan en la base.

## Estructura del repositorio

- `backend/app/core/` reúne la configuración, las sesiones y las clases compartidas de persistencia.
- `backend/app/modules/` contiene autenticación, usuarios, categorías, productos y pedidos.
- `backend/app/db/` contiene el seed. `backend/http/` reúne las solicitudes de REST Client.
- `frontend/src/features/` agrupa autenticación y usuarios, categorías, productos y pedidos.
- `frontend/src/routes/` contiene la navegación y sus permisos. `frontend/src/shared/` reúne el cliente HTTP y los componentes comunes, y `frontend/src/store/` guarda carrito, tema y avisos.

## Requisitos

- **Python 3.11 a 3.13.** Los ejemplos usan Python 3.12 y el lanzador `py` de Windows.
- **PostgreSQL 15 o superior**, iniciado y accesible con un usuario local. Podés usar pgAdmin para crear la base.
- **Node.js 24 y pnpm 9 o superior.** Node.js 24 es la versión recomendada para cubrir los requisitos de Vite y ESLint del lockfile actual.

Si descargaste el proyecto en ZIP, descomprimilo y abrí PowerShell en la carpeta que contiene `backend/` y `frontend/`. Usá una terminal para el backend y otra para el frontend.

## Instalación y ejecución del [backend](backend/README.md)

### Paso 1. Entrar a la carpeta del backend · obligatorio

Desde la carpeta raíz del proyecto, entrá a la carpeta del backend.

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

**Nota de compatibilidad.** La consigna del TPI (página 7) indica `python-multipart==0.0.20`, pero uso `0.0.34` porque corrige una vulnerabilidad del procesamiento de formularios que también puede afectar a FastAPI, incluido el login. La decisión se basa en este [aviso oficial de seguridad](https://github.com/Kludex/python-multipart/security/advisories/GHSA-5rvq-cxj2-64vf).

### Paso 5. Preparar PostgreSQL y crear una base vacía · obligatorio

Si todavía no tenés PostgreSQL, descargá el [instalador oficial para Windows](https://www.postgresql.org/download/windows/) e instalá el servidor y pgAdmin. Durante la instalación, definí la contraseña local del usuario `postgres` y anotá el puerto elegido, que por defecto es `5432`.

Con el servicio iniciado, abrí pgAdmin y conectate al servidor local con ese usuario. Sobre **Databases**, elegí **Create → Database**, poné `foodstore_tpi` como nombre y seleccioná como propietario el usuario que va a usar la API. Si ya existe una base con ese nombre, elegí otro y usalo en `DATABASE_URL`. El seed crea las tablas en la base vacía. Usá una base nueva si venís de una versión anterior, porque la creación de tablas no actualiza el esquema existente.

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

Pegá el valor generado en `SECRET_KEY` dentro de `backend/.env`. La aplicación exige al menos 32 caracteres y 32 bytes UTF-8 y rechaza el marcador del ejemplo. Guardá la clave y la contraseña de PostgreSQL en tu copia local de `.env`, que se excluye de Git.

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

Dejá el backend en ejecución. Desde la carpeta raíz del proyecto, entrá a la carpeta del frontend.

```powershell
Set-Location .\frontend
```

### Paso 2. Instalar las dependencias · obligatorio

Desde `frontend/`, instalá las versiones registradas en `pnpm-lock.yaml`.

```powershell
pnpm install --frozen-lockfile
```

### Paso 3. Configurar la URL de la API

Desde `frontend/`, copiá `.env.example` a `.env`. Si `.env` ya existe, revisá el valor y reiniciá Vite después de editarlo.

```powershell
if (-not (Test-Path -LiteralPath .env)) { Copy-Item -LiteralPath .env.example -Destination .env }
```

El ejemplo usa esta URL, que coincide con el valor predeterminado de Axios. Conservá el sufijo `/api/v1` si cambiás el host o el puerto.

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
| `SECRET_KEY` | Clave local de al menos 32 caracteres y 32 bytes UTF-8 para firmar JWT, en `backend/.env`. |
| `ALGORITHM` | Algoritmo JWT de firma y validación. El ejemplo usa `HS256`. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración de la sesión. El ejemplo usa 30 minutos. |
| `FRONTEND_ORIGIN` | Origen del frontend autorizado para CORS. El ejemplo usa `http://localhost:5173`. |
| `FRONTEND_ORIGINS` | Lista opcional, separada por comas. Si está definida, tiene prioridad sobre `FRONTEND_ORIGIN`. |
| `COOKIE_SECURE` | Usá `false` para desarrollo local con HTTP y `true` con HTTPS. |
| `VITE_API_URL` | URL base de la API que consume Vite. El ejemplo usa `http://localhost:8000/api/v1`. Es opcional en el entorno local predeterminado. |

## Historial e hitos

- **`base-tp9-tp10`.** Base integrada de los dos trabajos prácticos.
- **`tpi-infra`.** Configuración, fábrica de sesiones, repositorio y Unit of Work comunes.
- **`tpi-auth`.** Registro, inicio de sesión y administración de usuarios.
- **`tpi-catalogo`.** Catálogo público, administración de categorías y productos, y seed con stock inicial.
- **`tpi-pedidos`.** Backend transaccional en `4be7f16`, frontend de compra y administración en `0cf74e0`, y cierre documental en `57acc6b`.
- **Presentación y sesión.** Consolidación visual en `ae1bbd7`, correcciones de sesión en `2c62f8f` e integración de imágenes, firma y confirmaciones en `d86a682`.

El código está en el [repositorio público de Food Store](https://github.com/EmanuelABP/FoodStore_TPI_ProgramacionIV).

## Estado de la entrega

En las pruebas de esta etapa se ejecutó el seed dos veces en PostgreSQL y se completaron las 67 solicitudes de [pedidos.http](backend/http/pedidos.http). También se comprobó desde React el recorrido completo con FastAPI y PostgreSQL, incluidos el cambio de estado, la cancelación administrativa, la restitución del stock y la consulta del resumen. Los pedidos y los importes de esas pruebas dependen de la base utilizada.

Quedan pendientes el ZIP final, la instalación desde cero a partir de ese ZIP y el enlace al video de demostración.
