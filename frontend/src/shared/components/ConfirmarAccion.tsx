import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ErrorMensaje } from "./EstadoListado";

interface Props {
  titulo: string;
  confirmar: string;
  cancelarTexto?: string;
  peligro?: boolean;
  ocupado?: boolean;
  error?: string;
  children: ReactNode;
  onCerrar: () => void;
  onConfirmar: () => void | Promise<void>;
}

export default function ConfirmarAccion({
  titulo, confirmar, cancelarTexto = "Cancelar", peligro = false, ocupado = false,
  error, children, onCerrar, onConfirmar,
}: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const cancelar = useRef<HTMLButtonElement>(null);
  const aceptar = useRef<HTMLButtonElement>(null);
  const enCurso = useRef(false);
  const [enviando, setEnviando] = useState(false);
  const bloqueado = ocupado || enviando;
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

  async function confirmarAccion() {
    if (bloqueado || enCurso.current) return;
    enCurso.current = true;
    setEnviando(true);
    try {
      await onConfirmar();
    } finally {
      enCurso.current = false;
      setEnviando(false);
    }
  }

  return (
    <dialog ref={dialogo} aria-labelledby={tituloId} aria-describedby={mensajeId} aria-busy={bloqueado}
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
      onCancel={(evento) => { evento.preventDefault(); if (!bloqueado) onCerrar(); }}
      className="m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl backdrop:bg-black/60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
      <h2 id={tituloId} className="mb-4 text-xl font-bold">{titulo}</h2>
      <div id={mensajeId} className="space-y-3">{children}</div>
      {error && <div className="mt-4"><ErrorMensaje mensaje={error} /></div>}
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button ref={cancelar} type="button" disabled={bloqueado} className="btn-secundario" onClick={onCerrar}>{cancelarTexto}</button>
        <button ref={aceptar} type="button" disabled={bloqueado}
          className={peligro ? "btn-secundario btn-peligro" : "btn-primario"}
          onClick={() => { void confirmarAccion(); }}>{bloqueado ? "Procesando…" : confirmar}</button>
      </div>
    </dialog>
  );
}
