import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-4 px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Acceso denegado</h1>
      <p>Tu cuenta no tiene permiso para entrar a esta página.</p>
      <Link to="/" className="text-blue-700 underline dark:text-blue-300">Volver al inicio</Link>
    </main>
  );
}
