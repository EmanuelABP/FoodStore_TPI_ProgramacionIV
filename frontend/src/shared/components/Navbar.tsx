import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { useThemeStore } from "@/store/themeStore";
import { mensajeApi } from "@/shared/api/servicioCrud";

export default function Navbar() {
  const { user: sesion, checking, logout } = useAuth();
  const user = checking ? null : sesion;
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
        {user && (
          <>
            <div className="flex flex-wrap gap-2">
              <Link className={estiloEnlace} to="/categories">Categorías</Link>
              <Link className={estiloEnlace} to="/products">Productos</Link>
              <Link className={estiloEnlace} to="/ingredientes">Ingredientes</Link>
              {user.role === "admin" && <Link className={estiloEnlace} to="/admin/usuarios">Usuarios</Link>}
            </div>
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
