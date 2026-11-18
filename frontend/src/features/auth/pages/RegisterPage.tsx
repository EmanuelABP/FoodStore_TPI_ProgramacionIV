import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import CampoCatalogo from "@/shared/components/CampoCatalogo";
import { ErrorMensaje } from "@/shared/components/EstadoListado";
import { mensajeApi } from "@/shared/api/servicioCrud";
import AuthForm from "@/features/auth/components/AuthForm";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { registrar } = useAuth();
  const [error, setError] = useState("");
  const form = useForm({
    defaultValues: { username: "", full_name: "", email: "", password: "" },
    onSubmit: async ({ value }) => {
      setError("");
      try {
        await registrar({
          username: value.username.trim(), full_name: value.full_name.trim(),
          email: value.email.trim(), password: value.password,
        });
        navigate("/login", { replace: true });
      } catch (error) {
        setError(mensajeApi(error));
      }
    },
  });

  return (
    <AuthForm titulo="Crear cuenta" onSubmit={() => { void form.handleSubmit(); }}>
      <form.Field name="username" validators={{ onSubmit: ({ value }) => value.trim() ? undefined : "Ingresá un nombre de usuario." }}>
        {(campo) => (
          <CampoCatalogo nombre={campo.name} etiqueta="Usuario" autoComplete="username" maxLength={255}
            valor={campo.state.value} onChange={campo.handleChange} errores={campo.state.meta.errors} />
        )}
      </form.Field>
      <form.Field name="full_name" validators={{ onSubmit: ({ value }) => value.trim() ? undefined : "Ingresá tu nombre completo." }}>
        {(campo) => (
          <CampoCatalogo nombre={campo.name} etiqueta="Nombre completo" autoComplete="name"
            valor={campo.state.value} onChange={campo.handleChange} errores={campo.state.meta.errors} />
        )}
      </form.Field>
      <form.Field name="email" validators={{ onSubmit: ({ value }) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? undefined : "Ingresá un email válido." }}>
        {(campo) => (
          <CampoCatalogo nombre={campo.name} etiqueta="Email" tipo="email" autoComplete="email" maxLength={254}
            valor={campo.state.value} onChange={campo.handleChange} errores={campo.state.meta.errors} />
        )}
      </form.Field>
      <form.Field name="password" validators={{ onSubmit: ({ value }) => [...value].length >= 8 && new TextEncoder().encode(value).length <= 72 ? undefined : "Ingresá al menos 8 caracteres y hasta 72 bytes." }}>
        {(campo) => (
          <CampoCatalogo nombre={campo.name} etiqueta="Contraseña" tipo="password" autoComplete="new-password"
            valor={campo.state.value} onChange={campo.handleChange} errores={campo.state.meta.errors} />
        )}
      </form.Field>
      {error && <ErrorMensaje mensaje={error} />}
      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(enviando) => (
          <button type="submit" className="btn-primario w-full" disabled={enviando}>
            {enviando ? "Enviando…" : "Registrarme"}
          </button>
        )}
      </form.Subscribe>
      <Link className="block text-center text-blue-700 underline dark:text-blue-300" to="/login">Volver al login</Link>
    </AuthForm>
  );
}
