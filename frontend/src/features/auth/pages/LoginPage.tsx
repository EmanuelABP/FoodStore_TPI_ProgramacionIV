import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import CampoCatalogo from "@/shared/components/CampoCatalogo";
import { Cargando, ErrorMensaje } from "@/shared/components/EstadoListado";
import { mensajeApi } from "@/shared/api/servicioCrud";
import AuthForm from "@/features/auth/components/AuthForm";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const volverA: unknown = state?.volverA;
  const destino = volverA === "/checkout" || volverA === "/mis-pedidos" ? volverA : "/";
  const [error, setError] = useState("");
  const { login, checking, user } = useAuth();
  const form = useForm({
    defaultValues: { username: "", password: "" },
    onSubmit: async ({ value }) => {
      setError("");
      try {
        await login(value.username.trim(), value.password);
        navigate(destino, { replace: true });
      } catch (error) {
        setError(mensajeApi(error));
      }
    },
  });
  if (checking) return <Cargando mensaje="Comprobando sesión…" />;
  if (user) return <Navigate to={destino} replace />;

  return (
    <AuthForm titulo="Iniciar sesión" onSubmit={() => { void form.handleSubmit(); }}>
      <form.Field name="username" validators={{ onSubmit: ({ value }) => value.trim() ? undefined : "Ingresá tu nombre de usuario." }}>
        {(campo) => (
          <CampoCatalogo nombre={campo.name} etiqueta="Usuario" autoComplete="username" maxLength={255}
            valor={campo.state.value} onChange={campo.handleChange} errores={campo.state.meta.errors} />
        )}
      </form.Field>
      <form.Field name="password" validators={{ onSubmit: ({ value }) => value ? undefined : "Ingresá la contraseña." }}>
        {(campo) => (
          <CampoCatalogo nombre={campo.name} etiqueta="Contraseña" tipo="password" autoComplete="current-password"
            valor={campo.state.value} onChange={campo.handleChange} errores={campo.state.meta.errors} />
        )}
      </form.Field>
      {error && <ErrorMensaje mensaje={error} />}
      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(enviando) => (
          <button type="submit" className="btn-primario w-full" disabled={enviando}>
            {enviando ? "Enviando…" : "Ingresar"}
          </button>
        )}
      </form.Subscribe>
      <Link className="block text-center text-blue-700 underline dark:text-blue-300" to="/register">Crear cuenta</Link>
    </AuthForm>
  );
}
