import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { useCartStore } from "@/store/cartStore";
import { useThemeStore } from "@/store/themeStore";
import { mensajeApi } from "@/shared/api/servicioCrud";

const enlacesAdmin = [
  { ruta: "/admin/resumen", titulo: "Resumen" },
  { ruta: "/admin/categorias", titulo: "Categorías" },
  { ruta: "/admin/productos", titulo: "Productos" },
  { ruta: "/admin/pedidos", titulo: "Pedidos" },
  { ruta: "/admin/usuarios", titulo: "Usuarios" },
];

const estiloEnlace = "rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-sky-300";

export default function Navbar() {
  const { user: sesion, checking, logout } = useAuth();
  const user = checking ? null : sesion;
  const cantidad = useCartStore((state) => state.items.reduce((total, item) => total + item.cantidad, 0));
  const { darkMode, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [cerrando, setCerrando] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [adminAbierto, setAdminAbierto] = useState(false);
  const botonMenu = useRef<HTMLButtonElement>(null);
  const botonAdmin = useRef<HTMLButtonElement>(null);
  const seccionAdmin = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    document.documentElement.style.colorScheme = darkMode ? "dark" : "light";
  }, [darkMode]);

  useEffect(() => {
    if (!adminAbierto) return;

    function cerrarAlPulsarFuera(evento: PointerEvent) {
      if (evento.target instanceof Node && !seccionAdmin.current?.contains(evento.target)) {
        setAdminAbierto(false);
      }
    }

    document.addEventListener("pointerdown", cerrarAlPulsarFuera);
    return () => document.removeEventListener("pointerdown", cerrarAlPulsarFuera);
  }, [adminAbierto]);

  function cerrarMenus() {
    setAdminAbierto(false);
    setMenuAbierto(false);
  }

  async function cerrarSesion() {
    setError("");
    setCerrando(true);
    try {
      await logout();
      cerrarMenus();
      navigate("/login", { replace: true });
    } catch (error) {
      setError(mensajeApi(error));
    } finally {
      setCerrando(false);
    }
  }

  return (
    <header className="bg-slate-900 text-white shadow-md">
      <nav aria-label="Navegación principal"
        className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4 sm:px-6 xl:flex-nowrap"
        onKeyDown={(evento) => {
          if (evento.key !== "Escape") return;
          if (adminAbierto) {
            evento.preventDefault();
            setAdminAbierto(false);
            botonAdmin.current?.focus();
          } else if (menuAbierto && botonMenu.current?.getClientRects().length) {
            evento.preventDefault();
            cerrarMenus();
            botonMenu.current.focus();
          }
        }}>
        <Link to="/" className="shrink-0 rounded text-xl font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-sky-300"
          onClick={cerrarMenus}>Food Store</Link>
        <button ref={botonMenu} type="button" aria-expanded={menuAbierto} aria-controls="navegacion-food-store"
          className={`${estiloEnlace} border border-slate-600 xl:hidden`}
          onClick={() => {
            if (menuAbierto) cerrarMenus();
            else setMenuAbierto(true);
          }}>Menú</button>

        <div id="navegacion-food-store"
          className={`${menuAbierto ? "flex" : "hidden"} w-full min-w-0 flex-col gap-2 border-t border-slate-700 pt-2 xl:flex xl:flex-1 xl:flex-row xl:items-center xl:justify-between xl:border-0 xl:pt-0`}>
          <div className="flex min-w-0 flex-col gap-1 xl:flex-row xl:items-center xl:whitespace-nowrap">
            <Link className={estiloEnlace} to="/" onClick={cerrarMenus}>Catálogo</Link>
            <Link className={estiloEnlace} to="/carrito" onClick={cerrarMenus}>Carrito ({cantidad})</Link>
            {user && (
              <>
                {cantidad > 0 && <Link className={estiloEnlace} to="/checkout" onClick={cerrarMenus}>Checkout</Link>}
                <Link className={estiloEnlace} to="/mis-pedidos" onClick={cerrarMenus}>Mis pedidos</Link>
              </>
            )}
            {user?.role === "admin" && (
              <div ref={seccionAdmin} className="relative"
                onBlur={(evento) => {
                  if (!evento.currentTarget.contains(evento.relatedTarget)) setAdminAbierto(false);
                }}>
                <button ref={botonAdmin} type="button" aria-expanded={adminAbierto} aria-controls="enlaces-administracion"
                  className={`${estiloEnlace} flex w-full items-center justify-between gap-2`}
                  onClick={() => setAdminAbierto((actual) => !actual)}>
                  Administración
                  <span aria-hidden="true" className={adminAbierto ? "rotate-180" : ""}>▾</span>
                </button>
                <ul id="enlaces-administracion" hidden={!adminAbierto}
                  className="ml-3 space-y-1 rounded-lg border border-slate-700 bg-slate-800 p-1 xl:absolute xl:left-0 xl:top-full xl:z-30 xl:ml-0 xl:mt-1 xl:min-w-44 xl:shadow-lg">
                  {enlacesAdmin.map(({ ruta, titulo }) => (
                    <li key={ruta}>
                      <Link className={`${estiloEnlace} block`} to={ruta} onClick={cerrarMenus}>{titulo}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {!checking && !user && (
              <>
                <Link className={estiloEnlace} to="/login" onClick={cerrarMenus}>Iniciar sesión</Link>
                <Link className={estiloEnlace} to="/register" onClick={cerrarMenus}>Crear cuenta</Link>
              </>
            )}
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-1 border-t border-slate-700 pt-2 xl:flex-nowrap xl:border-0 xl:pt-0">
            {user && (
              <>
                <span title={user.full_name} className="w-full break-words px-3 text-sm xl:w-auto xl:min-w-0 xl:truncate xl:px-1">
                  {user.full_name} <span className="text-slate-300">({user.role})</span>
                </span>
                <button className={`${estiloEnlace} shrink-0`} type="button" disabled={cerrando}
                  onClick={() => { void cerrarSesion(); }}>Cerrar sesión</button>
              </>
            )}
            <button className={`${estiloEnlace} shrink-0`} type="button" aria-pressed={darkMode} onClick={toggleTheme}>
              {darkMode ? "Modo claro" : "Modo oscuro"}
            </button>
          </div>
        </div>
      </nav>
      {error && <p role="alert" className="mx-auto max-w-6xl px-4 pb-3 text-red-200 sm:px-6">{error}</p>}
    </header>
  );
}
