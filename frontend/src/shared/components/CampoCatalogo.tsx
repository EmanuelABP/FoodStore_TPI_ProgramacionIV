interface CampoProps {
  nombre: string;
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  errores?: readonly unknown[];
  tipo?: "text" | "number" | "email" | "password" | "tel";
  autoComplete?: string;
  maxLength?: number;
  multilinea?: boolean;
}

export default function CampoCatalogo({
  nombre, etiqueta, valor, onChange, errores = [], tipo = "text", multilinea = false, autoComplete, maxLength,
}: CampoProps) {
  const error = errores.find((item) => typeof item === "string");
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-800 dark:text-slate-200" htmlFor={nombre}>{etiqueta}</label>
      {multilinea ? (
        <textarea id={nombre} className="campo" rows={3} value={valor}
          onChange={(evento) => onChange(evento.target.value)} aria-invalid={Boolean(error)} />
      ) : (
        <input id={nombre} className="campo" type={tipo} value={valor} autoComplete={autoComplete} maxLength={maxLength}
          min={tipo === "number" ? 0 : undefined} step={tipo === "number" ? "any" : undefined}
          onChange={(evento) => onChange(evento.target.value)} aria-invalid={Boolean(error)} />
      )}
      {error && <p role="alert" className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>}
    </div>
  );
}
