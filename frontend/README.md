# Food Store — Frontend del TPI de Programación IV

**Tecnicatura Universitaria en Programación · UTN**  
**Alumno:** Emanuel Aaron Brahim Pollini

[README principal](../README.md) · [Guía del backend](../backend/README.md)

El frontend del TPI parte de la implementación del TP10. Está desarrollado con React 19, TypeScript en modo estricto, Vite y Tailwind CSS 4. Usa Axios, TanStack Query, Form y Table, React Router y Zustand.

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

## Estructura

- `src/features/auth/` contiene autenticación y administración de usuarios.
- `src/features/categories/` contiene la administración de categorías.
- `src/features/products/` contiene el catálogo público y la administración de productos.
- `src/shared/` reúne la instancia de Axios, sus interceptores y los componentes reutilizables.
- `src/routes/` define la navegación y la protección por sesión y rol.
- `src/store/` reúne el carrito, la preferencia de tema y las notificaciones. El store de autenticación vive en `src/features/auth/store/`.

## Funcionalidades

### Catálogo público

En `/` se pueden consultar productos sin iniciar sesión, buscar por nombre y filtrar por categoría. La búsqueda, el filtro y la paginación se resuelven en la API. La página muestra un esqueleto de carga, un estado vacío o un mensaje de error cuando corresponde. Los productos activos de categorías dadas de baja siguen apareciendo. Los productos sin stock o no disponibles se muestran con su estado y con el botón de agregado deshabilitado.

**Agregar al carrito** actualiza un store de Zustand persistido en el navegador. Cada línea guarda el ID del producto, su nombre, el precio unitario y la cantidad. El store permite quitar líneas, cambiar cantidades, vaciar el carrito y calcular el total. La página del carrito, el checkout, los pedidos y el resumen administrativo se incorporarán en etapas posteriores.

### Autenticación y administración

- **`/login` y `/register`.** El login usa nombre de usuario y contraseña. El registro solicita nombre de usuario, nombre completo, email y contraseña de al menos ocho caracteres. Ambos formularios usan TanStack Form y muestran los errores de la API.
- **Sesión.** Axios envía la cookie HttpOnly con `withCredentials`. Zustand guarda el perfil público en `sessionStorage`. Al abrir o recargar la aplicación, `checkSession` consulta `/api/v1/auth/me` y la interfaz espera esa comprobación antes de abrir las rutas protegidas. Desde la barra de navegación se puede cerrar sesión.
- **`/admin/categorias`.** Listado, alta, edición y baja lógica de categorías.
- **`/admin/productos`.** Listado, alta, edición y baja lógica de productos. Cada producto tiene una categoría. El ajuste de stock y disponibilidad usa el endpoint PATCH específico.
- **`/admin/usuarios`.** Listado y activación o desactivación de cuentas. La acción para desactivar la cuenta propia no aparece.

Las rutas administrativas requieren el rol `admin`. Sin sesión, redirigen a `/login`. Con sesión y sin ese rol, redirigen a `/unauthorized`. TanStack Table organiza las tablas, TanStack Form gestiona los formularios de alta y edición de catálogo, y TanStack Query actualiza los datos después de las mutaciones. El panel de productos solicita hasta 100 registros y pagina esa lista en el navegador.
