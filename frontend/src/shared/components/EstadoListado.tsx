interface EstadoProps {
  mensaje: string;
}

export function Cargando({ mensaje }: EstadoProps) {
  return <p role="status" className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">{mensaje}</p>;
}

export function Vacio({ mensaje }: EstadoProps) {
  return <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">{mensaje}</p>;
}

export function ErrorMensaje({ mensaje }: EstadoProps) {
  return <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">{mensaje}</p>;
}
