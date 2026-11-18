import ConfirmarAccion from "@/shared/components/ConfirmarAccion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Cargando, ErrorMensaje, Vacio } from "@/shared/components/EstadoListado";
import DetallePedido from "../components/DetallePedido";
import EstadoPedidoBadge from "../components/EstadoPedidoBadge";
import PaginacionPedidos from "../components/PaginacionPedidos";
import { fechaPedido, formasPago, importe } from "../formato";
import { useCancelarPedido, usePedidos } from "../hooks/usePedidos";

const limite = 20;

export default function MisPedidosPage() {
  const [pagina, setPagina] = useState(0);
  const [detalleId, setDetalleId] = useState<number | null>(null);
  const [cancelarId, setCancelarId] = useState<number | null>(null);
  const pedidos = usePedidos({ skip: pagina * limite, limit: limite }, true);
  const cancelacion = useCancelarPedido();

  function cancelar(id: number) {
    if (cancelacion.isPending) return;
    cancelacion.reset();
    setCancelarId(id);
  }

  return (
    <main className="mx-auto max-w-5xl space-y-5 px-6 py-10">
      <h1 className="text-3xl font-bold">Mis pedidos</h1>
      {cancelacion.error && <ErrorMensaje mensaje={cancelacion.error.message} />}
      {pedidos.isPending ? <Cargando mensaje="Cargando tus pedidos…" /> :
        pedidos.isError ? <ErrorMensaje mensaje={pedidos.error.message} /> :
        pedidos.data?.items.length ? (
          <ul className="space-y-3">
            {pedidos.data.items.map((pedido) => (
              <li key={pedido.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                <div className="min-w-0 max-w-full space-y-1">
                  <div className="flex items-center gap-3"><h2 className="font-semibold">Pedido #{pedido.id}</h2><EstadoPedidoBadge estado={pedido.estado} /></div>
                  <p className="text-sm">{fechaPedido(pedido.created_at)} · {formasPago[pedido.forma_pago]}</p>
                  <p className="importe font-semibold">{importe(pedido.total)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="btn-secundario" aria-expanded={detalleId === pedido.id}
                    onClick={() => setDetalleId(pedido.id)}>Ver detalle</button>
                  {pedido.estado === "PENDIENTE" && (
                    <button type="button" className="btn-secundario text-red-700 dark:text-red-300"
                      disabled={cancelacion.isPending} onClick={() => cancelar(pedido.id)}>Cancelar pedido</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : <Vacio mensaje="No hay pedidos en esta página." />}
      <PaginacionPedidos pagina={pagina} limite={limite} total={pedidos.data?.total ?? 0}
        cargando={pedidos.isPending} onPagina={setPagina} />
      {cancelarId !== null && (
        <ConfirmarAccion titulo={`Cancelar pedido #${cancelarId}`} confirmar="Cancelar pedido" cancelarTexto="Volver" peligro
          ocupado={cancelacion.isPending} error={cancelacion.error?.message} onCerrar={() => setCancelarId(null)}
          onConfirmar={async () => {
            try { await cancelacion.mutateAsync(cancelarId); setCancelarId(null); }
            catch { /* El modal muestra el error y la consulta se refresca. */ }
          }}>
          <p>¿Querés cancelar este pedido?</p>
          <p>La cancelación restituirá el stock de sus productos y no podrá revertirse.</p>
        </ConfirmarAccion>
      )}
      {detalleId !== null && <DetallePedido id={detalleId} propio onCerrar={() => setDetalleId(null)} />}
      <Link to="/" className="inline-block text-blue-700 underline dark:text-blue-300">Volver al catálogo</Link>
    </main>
  );
}
