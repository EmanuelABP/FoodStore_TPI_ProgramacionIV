# Food Store — Frontend

**Trabajo Práctico:** Unidad 10 — Autorización y rutas protegidas  
**Materia:** Programación IV · UTN TUP  
**Alumno:** Emanuel Aaron Brahim Pollini

## Instalación y ejecución

Necesito Node.js 24, pnpm y el backend de la Unidad 9 en funcionamiento. Con la API iniciada en `http://localhost:8000`, ejecuto desde la carpeta del frontend:

```powershell
pnpm install
pnpm dev
```

Abro [localhost:5173](http://localhost:5173). Si uso otro origen de la API, configuro `VITE_API_URL` antes de iniciar Vite y verifico que el backend permita el origen del frontend. Para compilar la versión de producción ejecuto `pnpm build`.

## Estructura

- `src/features/` agrupa autenticación, categorías, productos e ingredientes. Cada dominio tiene sus componentes, hooks, tipos y páginas, y expone su API pública en `index.ts`.
- `src/shared/` contiene los componentes reutilizables, el hook compartido del catálogo y Axios con sus interceptores.
- `src/routes/` define las rutas y comprueba la sesión y los permisos antes de montar cada página.
- `src/store/` contiene la preferencia de tema y las notificaciones. `App.tsx` verifica la sesión y monta el router y el aviso global.

Al recargar, la aplicación consulta `/api/v1/auth/me` usando la cookie HttpOnly. Solo se guarda la preferencia de tema en el navegador. Con una sesión activa puedo consultar el catálogo. Con el rol `admin` puedo modificarlo, asociar categorías e ingredientes a productos y acceder a `/admin/users`. El tema se cambia desde la barra de navegación y los avisos se ocultan a los tres segundos.
