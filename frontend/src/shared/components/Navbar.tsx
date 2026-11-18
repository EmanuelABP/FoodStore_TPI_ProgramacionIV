import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { useCartStore } from "@/store/cartStore";
import { useThemeStore } from "@/store/themeStore";
import { mensajeApi } from "@/shared/api/servicioCrud";

export default function Navbar() {
  const { user: sesion, checking, logout } = useAuth();
  const user = checking ? null : sesion;
  const cantidad = useCartStore((state) => state.items.reduce((total, item) => total + item.cantidad, 0));
  const { darkMode, toggleTheme } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [cerrando, setCerrando] = useState(false);
  const estiloEnlace = "rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-700";

  async function cerrarSesion() {
    setError("");
    setCerrando(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      setError(mensajeApi(error));
    } finally {
      setCerrando(false);
    }
  }

  return (
    <header className="bg-slate-900 text-white shadow-md">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-5">
        <Link to="/" className="text-xl font-bold tracking-tight">Food Store</Link>
        <div className="flex flex-wrap gap-2">
          <Link className={estiloEnlace} to="/">Catálogo</Link>
          <Link className={estiloEnlace} to="/carrito">Carrito ({cantidad})</Link>
          {user && (
            <>
              {cantidad > 0 && <Link className={estiloEnlace} to="/checkout">Checkout</Link>}
              <Link className={estiloEnlace} to="/mis-pedidos">Mis pedidos</Link>
            </>
          )}
          {user?.role === "admin" && (
            <>
              <Link className={estiloEnlace} to="/admin/categorias">Administrar categorías</Link>
              <Link className={estiloEnlace} to="/admin/productos">Administrar productos</Link>
              <Link className={estiloEnlace} to="/admin/usuarios">Usuarios</Link>
              <Link className={estiloEnlace} to="/admin/pedidos">Administrar pedidos</Link>
              <Link className={estiloEnlace} to="/admin/resumen">Resumen</Link>
            </>
          )}
          {!checking && !user && (
            <>
              <Link className={estiloEnlace} to="/login">Iniciar sesión</Link>
              <Link className={estiloEnlace} to="/register">Crear cuenta</Link>
            </>
          )}
        </div>
        {user && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <span>{user.full_name} <span className="text-slate-300">({user.role})</span></span>
              <button className={estiloEnlace} type="button" disabled={cerrando}
                onClick={() => { void cerrarSesion(); }}>Cerrar sesión</button>
            </div>
          </>
        )}
        <button className={estiloEnlace} type="button" aria-pressed={darkMode} onClick={toggleTheme}>
          {darkMode ? "Modo claro" : "Modo oscuro"}
        </button>
        {error && <p role="alert" className="w-full text-red-200">{error}</p>}
      </nav>
    </header>
  );
}
