import type { FormEvent, ReactNode } from "react";
import { ErrorMensaje } from "./EstadoListado";

export interface ModalProps {
  ocupado: boolean;
  error?: string;
  onCerrar: () => void;
}

interface MarcoProps extends ModalProps {
  titulo: string;
  onSubmit: () => void;
  children: ReactNode;
}

export default function ModalCatalogo({ titulo, ocupado, error, onCerrar, onSubmit, children }: MarcoProps) {
  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!ocupado) onSubmit();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <section role="dialog" aria-modal="true" aria-labelledby="titulo-modal"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 id="titulo-modal" className="text-xl font-bold text-slate-800 dark:text-slate-200">{titulo}</h2>
          <button type="button" aria-label="Cerrar formulario" disabled={ocupado}
            className="btn-secundario" onClick={onCerrar}>×</button>
        </div>
        <form onSubmit={enviar} className="space-y-4" noValidate>
          <fieldset disabled={ocupado} className="space-y-4">{children}</fieldset>
          {error && <ErrorMensaje mensaje={error} />}
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
            <button type="button" className="btn-secundario" disabled={ocupado} onClick={onCerrar}>Cancelar</button>
            <button type="submit" className="btn-primario" disabled={ocupado}>
              {ocupado ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
