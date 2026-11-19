# Food Store — Backend del TPI de Programación IV

**Programación IV · UTN**  
**Alumno:** Emanuel Aaron Brahim Pollini

[README principal](../README.md) · [Guía del frontend](../frontend/README.md) · [Video de demostración](https://youtu.be/NnbvWN_Fq0Y)

## Arquitectura y modelo de datos

El backend implementa la API completa de Food Store con FastAPI, Pydantic y SQLModel sobre PostgreSQL. Los módulos `auth`, `usuarios`, `categorias`, `productos` y `pedidos`, dentro de `app/modules/`, cubren autenticación, usuarios, catálogo y pedidos, incluidas las transacciones de stock y el resumen administrativo. El núcleo `app/core/` contiene la configuración, la fábrica de sesiones, la seguridad y las clases compartidas. `app/db/` contiene el seed y `http/` reúne las solicitudes de REST Client.

En categorías, productos y pedidos, el flujo es **Router → Service → Unit of Work → Repository → Model**. El router aplica permisos y traduce errores a HTTP. El servicio ejecuta las reglas de negocio y construye la respuesta dentro del Unit of Work. Este abre la sesión, la comparte con los repositorios, hace commit o rollback y cierra la sesión. Los repositorios de dominio usan `BaseRepository[T]`. Los schemas separan los datos de entrada y salida de los modelos de tabla.

| Entidades SQLModel | Relación |
|---|---|
| `Categoria` y `Producto` | Una categoría agrupa productos mediante `Categoria.productos` y `Producto.categoria`. Cada producto tiene un `categoria_id`. |
| `Usuario` y `Pedido` | Un usuario puede realizar varios pedidos mediante `Usuario.pedidos` y `Pedido.usuario`. |
| `Pedido` y `DetallePedido` | Un pedido contiene sus líneas mediante `Pedido.items` y `DetallePedido.pedido`. |
| `Producto` y `DetallePedido` | Una línea referencia un producto mediante `Producto.detalles` y `DetallePedido.producto`. |

La baja de categorías y productos usa `activo=false`. Una categoría inactiva conserva su nombre y sus relaciones. Sus productos activos siguen visibles en el catálogo. La desactivación de usuarios usa `disabled=true`. Los pedidos se conservan en la base y se cancelan mediante un cambio de estado.

La autenticación utiliza los roles `user` y `admin`. Passlib y bcrypt protegen las contraseñas. Python-jose firma el JWT y FastAPI lo entrega en la cookie `access_token` con HttpOnly y SameSite=Lax. CORS permite credenciales desde orígenes explícitos.

## Instalación y ejecución en Windows

Usá Python 3.11 a 3.13 y PostgreSQL 15 o superior. La guía usa Python 3.12 y PowerShell.

Las dependencias directas están fijadas en [requirements.txt](requirements.txt). Cito las versiones del archivo para que sea fácil verificar la instalación.

| Paquetes | Versiones |
|---|---|
| FastAPI con extra `standard` y Uvicorn | `0.163.2` y `0.54.0` |
| SQLModel, SQLAlchemy y psycopg2-binary | `0.0.50`, `2.1.9` y `2.9.13` |
| Pydantic, pydantic-settings y python-dotenv | `2.14.3`, `2.16.3` y `1.2.4` |
| Passlib con extra `bcrypt`, bcrypt y python-jose con extra `cryptography` | `1.7.4`, `4.0.1` y `3.5.0` |
| email-validator y python-multipart | `2.4.0` y `0.0.34` |
| tzdata (datos IANA para zonas horarias, también en Windows) | `2026.6` |

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

## Detalles de configuración

`Settings` lee `backend/.env` mediante la ruta del proyecto. Las variables del entorno del proceso tienen prioridad sobre el archivo. La lista opcional `FRONTEND_ORIGINS`, cuando está definida, tiene prioridad sobre el origen singular `FRONTEND_ORIGIN`. Para usar solamente el origen singular, dejá la lista sin definir.

`ACCESS_TOKEN_EXPIRE_MINUTES` define la vigencia del token y la cookie. `ALGORITHM` selecciona el algoritmo de firma y validación JWT. El ejemplo usa `HS256`. Para HTTPS usá `COOKIE_SECURE=true`. En local, usá el mismo host `localhost` en FastAPI y Vite para que el navegador envíe la cookie de sesión.

Para ejecutar la interfaz junto a la API, seguí la [guía del frontend](../frontend/README.md).

## Rutas principales

### Autenticación y usuarios

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

### Pedidos

| Método y ruta | Acceso y respuesta |
|---|---|
| POST `/api/v1/pedidos` | Sesión activa. Crea un pedido propio. Devuelve 201 con `PedidoRead`, 404 por producto inexistente o inactivo, y 400 por stock insuficiente, producto no disponible o repetido. |
| GET `/api/v1/pedidos` | Sesión activa. El rol `user` recibe sus pedidos y `admin` recibe todos. Devuelve 200 con `PedidosPaginados`. |
| GET `/api/v1/pedidos/resumen` | Admin. Devuelve 200 con `ResumenPedidos`. |
| GET `/api/v1/pedidos/{id}` | Dueño o admin. Devuelve 200 con `PedidoRead`, 404 si no existe y 403 si un usuario común consulta un pedido ajeno. |
| PATCH `/api/v1/pedidos/{id}/estado` | Admin. Recibe `estado` y devuelve 200 con `PedidoRead`, 404 si no existe o 400 si la transición es inválida. |
| PATCH `/api/v1/pedidos/{id}/cancelar` | Dueño del pedido. Devuelve 200 con `PedidoRead`, 404 si no existe, 403 si es ajeno y 400 si ya salió de `PENDIENTE`. |

El listado recibe `skip` (0 por defecto), `limit` (20 por defecto y 100 como máximo) y `estado` opcional. Devuelve `total` e `items`. Los cuerpos o parámetros inválidos devuelven 422. Una ruta protegida devuelve 401 sin sesión válida y 400 si la cuenta está desactivada.

- **RN-01 · Alta.** El cuerpo contiene `items` con `producto_id` y `cantidad`, más los datos de entrega y pago. El dueño se obtiene de la sesión. La API valida productos activos y disponibles, stock suficiente y ausencia de duplicados. Bloquea los productos, descuenta el stock y guarda las líneas y el total dentro de la misma transacción. Un error revierte la operación completa.
- **RN-02 · Estados.** Desde `PENDIENTE` se puede pasar a `EN_PREPARACION` o `CANCELADO`. Desde `EN_PREPARACION` se puede pasar a `ENTREGADO` o `CANCELADO`. Los dos últimos estados son terminales.
- **RN-03 · Cancelación.** El cambio a `CANCELADO` y la restitución del stock de cada línea se confirman juntos. El bloqueo del pedido evita restituir el stock dos veces.
- **RN-04 · Permisos.** El usuario común ve sus pedidos y puede cancelar los propios en `PENDIENTE`. El administrador consulta todos y usa `/estado` para avanzar o cancelar pedidos en estados permitidos. Ambos roles pueden realizar pedidos propios.
- **RN-05 · Historial.** El nombre y el precio unitario se copian del producto al comprar. El subtotal es el precio unitario por la cantidad y el total es la suma de subtotales. Se mantienen fijos. Los pedidos se conservan y su única modificación es el cambio de estado.
- **RN-06 · Validaciones.** Cada pedido requiere al menos un ítem, cantidades enteras positivas, una dirección de 5 a 200 caracteres y un medio de pago `EFECTIVO` o `TRANSFERENCIA`. Las notas son opcionales.

El resumen devuelve los conteos de los cuatro estados, los pedidos creados en el día local de Argentina (`America/Argentina/Buenos_Aires`) y los ingresos, que suman solo los totales de pedidos `ENTREGADO`. Las fechas se almacenan en UTC; los límites del día local se convierten a UTC para realizar la consulta.

## Pruebas con REST Client

Con la API iniciada y el seed cargado en una base de prueba, abrí [auth.http](http/auth.http), [categorias.http](http/categorias.http), [productos.http](http/productos.http) o [pedidos.http](http/pedidos.http) en VS Code con la extensión REST Client. Mantené habilitadas las cookies y ejecutá las solicitudes en orden con **Send Request**. Para repetir una secuencia de altas, cambiá `@lote` en el archivo correspondiente.

El archivo de pedidos tiene 67 solicitudes. Cubre autenticación, permisos, descuento y restitución de stock, alta fallida con rollback, transiciones, historial de líneas y resumen. Cuando una solicitud usa un ID de otra respuesta, ejecutá primero la solicitud que lo genera. Los totales del resumen dependen de los pedidos que ya tenga la base de prueba.
