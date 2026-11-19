# Food Store — Frontend del TPI de Programación IV

**Tecnicatura Universitaria en Programación · UTN**  
**Alumno:** Emanuel Aaron Brahim Pollini

[README principal](../README.md) · [Guía del backend](../backend/README.md) · [Video de demostración](https://youtu.be/NnbvWN_Fq0Y)

El frontend ofrece el catálogo, el recorrido de compra y el panel de administración. Está desarrollado con React 19, TypeScript en modo estricto, Vite y Tailwind CSS 4. Usa Axios, TanStack Query, Form y Table, React Router y Zustand.

## Preparar Node.js y pnpm

Instalá **Node.js 24** y **pnpm 9 o superior**. Node.js 24 cubre los requisitos de Vite y ESLint del lockfile actual. Abrí PowerShell desde la raíz de `FoodStore_TPI_ProgramacionIV` una vez instaladas las herramientas.

Desde la raíz, comprobá que PowerShell encuentre Node.js y mostrá su versión.

```powershell
node --version
```

Desde la raíz, comprobá también que pnpm esté disponible en la terminal.

```powershell
pnpm --version
```

## Instalación y ejecución

Antes de iniciar Vite, configurá y levantá la API siguiendo la [guía del backend](../backend/README.md).

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

## Estructura

- `src/features/auth/` contiene autenticación y administración de usuarios.
- `src/features/categories/` contiene la administración de categorías.
- `src/features/products/` contiene el catálogo público y la administración de productos.
- `src/features/pedidos/` reúne las páginas de carrito, checkout, pedidos y resumen, junto con sus componentes, hooks, API y tipos.
- `src/shared/` reúne la instancia de Axios, sus interceptores y los componentes reutilizables.
- `src/routes/` define la navegación y la protección por sesión y rol.
- `src/store/` reúne el carrito, la preferencia de tema y las notificaciones. El store de autenticación vive en `src/features/auth/store/`.

## Funcionalidades

### Compra y pedidos propios

El flujo es **Catálogo → Carrito → Inicio de sesión, si hace falta → Checkout → Mis pedidos**.

- **`/` · Catálogo público.** Búsqueda por nombre, filtro por categoría y paginación del servidor. Muestra carga, ausencia de resultados o error según corresponda. En los productos sin stock o no disponibles, el botón de agregado queda deshabilitado.
- **`/carrito` · Público.** Permite ajustar cantidades según el stock, quitar productos, vaciar el carrito y consultar subtotales y total estimado. Zustand persiste los ítems en el navegador y conserva el carrito al recargar o iniciar sesión.
- **`/checkout` · Sesión activa.** TanStack Form captura la dirección de entrega, el medio de pago y las notas opcionales. Los medios disponibles son efectivo y transferencia. Se vuelve a consultar el stock antes de confirmar y el backend calcula el total definitivo. Si la API confirma el pedido, se vacía el carrito y se abre `/mis-pedidos`. Si falla, la selección se conserva.
- **`/mis-pedidos` · Sesión activa.** Muestra los pedidos propios y permite consultar dirección, pago y líneas con sus precios históricos. El botón de cancelación aparece para pedidos propios en estado `PENDIENTE`.

### Acceso y sesión

- **`/login` y `/register`.** Los dos formularios usan TanStack Form. El login recibe el nombre de usuario y la contraseña. El registro también pide nombre completo y correo. Si entraste al login desde el checkout, volvés a la compra.
- **Sesión.** Axios usa `withCredentials` para que el navegador envíe la cookie HttpOnly. Zustand guarda el perfil público en `sessionStorage`. Al abrir o recargar la aplicación, `checkSession` consulta `/api/v1/auth/me`. La barra de navegación permite cerrar la sesión.
- **Permisos.** `ProtectedRoute` espera la validación de sesión, redirige a `/login` cuando hace falta y muestra `/unauthorized` cuando el rol carece de acceso. Los usuarios comunes pueden comprar y administrar sus propios pedidos en los estados permitidos. Los administradores también tienen acceso al panel.

### Panel administrativo

| Ruta | Funcionalidad |
|---|---|
| `/admin/categorias` | Listado, alta, edición y baja lógica. |
| `/admin/productos` | Listado, alta, edición, baja lógica y ajuste de stock y disponibilidad. |
| `/admin/usuarios` | Listado, activación y desactivación de cuentas. |
| `/admin/pedidos` | Listado paginado por el servidor, filtro por estado, detalle y transiciones permitidas. |
| `/admin/resumen` | Pendientes, en preparación, entregados, cancelados, pedidos de hoy e ingresos de pedidos entregados. Los valores provienen de la API. |

El panel usa TanStack Table para los listados y TanStack Form en el alta y la edición del catálogo. TanStack Query gestiona las peticiones e invalida pedidos, detalle y resumen después de una mutación. Cuando un alta o una cancelación modifica stock, también se actualizan las consultas de productos. La caché privada se limpia al cambiar de usuario o de rol.

La barra de navegación permite elegir modo claro u oscuro y guarda la preferencia en el navegador.
