# Food Store — Frontend del TPI de Programación IV

**Tecnicatura Universitaria en Programación · UTN**  
**Alumno:** Emanuel Aaron Brahim Pollini

[README principal](../README.md) · [Guía del backend](../backend/README.md)

El frontend del TPI parte de la implementación del TP10. Está desarrollado con React, TypeScript, Vite y Tailwind. Usa Axios, TanStack Query, Form y Table, React Router y Zustand.

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

### Paso 3. Configurar la URL de la API · opcional

El frontend usa `http://localhost:8000` por defecto. Si la API está en otro host o puerto, desde `frontend/` definí `VITE_API_URL` en la misma terminal donde vas a iniciar Vite. Reemplazá el valor del ejemplo por el origen de tu API. Los servicios agregan sus rutas, por lo que el valor contiene solo el esquema, el host y el puerto.

```powershell
$env:VITE_API_URL = "http://localhost:8000"
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

Abrí [Food Store](http://localhost:5173) e iniciá sesión con el email y la contraseña que configuraste en el seed. Usá `localhost` para los dos servidores. Si Vite muestra otro puerto, agregá ese origen a la configuración CORS del backend y reiniciá la API. Si está definida `FRONTEND_ORIGINS`, actualizá esa lista. En caso contrario, editá `FRONTEND_ORIGIN`.

## Estructura

- `src/features/` agrupa autenticación, categorías, productos e ingredientes. Cada área reúne sus páginas, componentes, hooks, tipos y servicios, y publica sus puntos de entrada en `index.ts`.
- `src/shared/` contiene la instancia de Axios, sus interceptores y los componentes reutilizables del catálogo.
- `src/routes/` define la navegación y las restricciones por sesión y rol.
- `src/store/` contiene la preferencia de tema y las notificaciones. El store de autenticación vive en `src/features/auth/store/`. `App.tsx` verifica la sesión y monta el router y el aviso global.

## Estado del frontend

- **Disponible.** Registro e inicio de sesión por email, recuperación de sesión al recargar con `/api/v1/auth/me`, catálogo con sesión y rutas protegidas. El rol `admin` puede administrar categorías, productos e ingredientes, vincular categorías e ingredientes a productos y activar o desactivar usuarios en `/admin/users`. La barra de navegación permite cambiar de tema y los avisos se ocultan a los tres segundos. La sesión usa una cookie HttpOnly y el navegador conserva la preferencia de tema.
- **Pendiente del TPI.** Catálogo público, carrito, checkout, consulta de pedidos propios y panel de gestión de stock y pedidos.
