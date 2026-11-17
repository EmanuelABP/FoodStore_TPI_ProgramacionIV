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
    defaultValues: { nombre: "", apellido: "", email: "", celular: "", password: "" },
    onSubmit: async ({ value }) => {
      setError("");
      try {
        await registrar({
          nombre: value.nombre.trim(), apellido: value.apellido.trim(), email: value.email.trim(),
          celular: value.celular.trim() || undefined, password: value.password,
        });
        navigate("/login", { replace: true });
      } catch (error) {
        setError(mensajeApi(error));
      }
    },
  });

  return (
    <AuthForm titulo="Crear cuenta" onSubmit={() => { void form.handleSubmit(); }}>
      <form.Field name="nombre" validators={{ onSubmit: ({ value }) => value.trim() ? undefined : "Ingresá el nombre." }}>
        {(campo) => (
          <CampoCatalogo nombre={campo.name} etiqueta="Nombre" tipo="text" autoComplete="given-name" maxLength={80}
            valor={campo.state.value} onChange={campo.handleChange} errores={campo.state.meta.errors} />
        )}
      </form.Field>
      <form.Field name="apellido" validators={{ onSubmit: ({ value }) => value.trim() ? undefined : "Ingresá el apellido." }}>
        {(campo) => (
          <CampoCatalogo nombre={campo.name} etiqueta="Apellido" tipo="text" autoComplete="family-name" maxLength={80}
            valor={campo.state.value} onChange={campo.handleChange} errores={campo.state.meta.errors} />
        )}
      </form.Field>
      <form.Field name="email" validators={{ onSubmit: ({ value }) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? undefined : "Ingresá un email válido." }}>
        {(campo) => (
          <CampoCatalogo nombre={campo.name} etiqueta="Email" tipo="email" autoComplete="username" maxLength={254}
            valor={campo.state.value} onChange={campo.handleChange} errores={campo.state.meta.errors} />
        )}
      </form.Field>
      <form.Field name="celular">
        {(campo) => (
          <CampoCatalogo nombre={campo.name} etiqueta="Celular (opcional)" tipo="tel" autoComplete="tel" maxLength={20}
            valor={campo.state.value} onChange={campo.handleChange} errores={campo.state.meta.errors} />
        )}
      </form.Field>
      <form.Field name="password" validators={{ onSubmit: ({ value }) => value.length >= 8 && new TextEncoder().encode(value).length <= 72 ? undefined : "Ingresá al menos 8 caracteres y hasta 72 bytes." }}>
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
