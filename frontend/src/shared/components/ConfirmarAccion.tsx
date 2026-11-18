import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";

interface Props {
  titulo: string;
  confirmar: string;
  peligro?: boolean;
  children: ReactNode;
  onCerrar: () => void;
  onConfirmar: () => void;
}

export default function ConfirmarAccion({ titulo, confirmar, peligro = false, children, onCerrar, onConfirmar }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const cancelar = useRef<HTMLButtonElement>(null);
  const aceptar = useRef<HTMLButtonElement>(null);
  const tituloId = useId();
  const mensajeId = useId();

  useEffect(() => {
    const elemento = dialogo.current;
    const anterior = document.activeElement;
    elemento?.showModal();
    cancelar.current?.focus();
    return () => {
      elemento?.close();
      if (anterior instanceof HTMLElement && anterior.isConnected) anterior.focus();
    };
  }, []);

  return (
    <dialog ref={dialogo} aria-labelledby={tituloId} aria-describedby={mensajeId}
      onKeyDown={(evento) => {
        if (evento.key !== "Tab") return;
        if (evento.shiftKey && document.activeElement === cancelar.current) {
          evento.preventDefault();
          aceptar.current?.focus();
        } else if (!evento.shiftKey && document.activeElement === aceptar.current) {
          evento.preventDefault();
          cancelar.current?.focus();
        }
      }}
      onCancel={(evento) => { evento.preventDefault(); onCerrar(); }}
      className="m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl backdrop:bg-black/60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
      <h2 id={tituloId} className="mb-4 text-xl font-bold">{titulo}</h2>
      <div id={mensajeId} className="space-y-3">{children}</div>
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button ref={cancelar} type="button" className="btn-secundario" onClick={onCerrar}>Cancelar</button>
        <button ref={aceptar} type="button" className={peligro ? "btn-secundario btn-peligro" : "btn-primario"}
          onClick={onConfirmar}>{confirmar}</button>
      </div>
    </dialog>
  );
}
