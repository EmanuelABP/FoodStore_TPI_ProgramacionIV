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

## Estructura

- `src/features/` agrupa autenticación, categorías, productos e ingredientes. Cada área reúne sus páginas, componentes, hooks, tipos y servicios, y publica sus puntos de entrada en `index.ts`.
- `src/shared/` contiene la instancia de Axios, sus interceptores y los componentes reutilizables del catálogo.
- `src/routes/` define la navegación y las restricciones por sesión y rol.
- `src/store/` contiene la preferencia de tema y las notificaciones. El store de autenticación vive en `src/features/auth/store/`. `App.tsx` verifica la sesión y monta el router y el aviso global.

## Estado del frontend

- **Autenticación.** El login envía `username` y `password` en un formulario OAuth2. El registro solicita `username`, `full_name`, `email` y `password` de al menos ocho caracteres. Los formularios usan TanStack Form y muestran los errores de la API.
- **Sesión y permisos.** Axios envía la cookie HttpOnly con `withCredentials`. Zustand guarda únicamente el perfil público en `sessionStorage`. Al abrir o recargar la aplicación, `checkSession` consulta `/api/v1/auth/me` y mantiene las rutas protegidas en espera hasta confirmar la sesión. El permiso para administrar usuarios depende de `role === "admin"`.
- **Usuarios.** En `/admin/usuarios`, la tabla muestra nombre de usuario, nombre completo, email, rol y estado. Activar y desactivar actualiza el listado mediante TanStack Query. El administrador ve la acción Desactivar en las cuentas activas de otros usuarios.
- **Catálogo heredado.** Categorías, productos e ingredientes conservan sus pantallas con sesión y sus rutas actuales. Para esas peticiones, Axios usa el origen de la API sin el prefijo `/api/v1`. La interfaz conserva el tema y los avisos existentes.
- **Pendiente del TPI.** Catálogo público, carrito, checkout, consulta de pedidos propios y panel de gestión de stock y pedidos.