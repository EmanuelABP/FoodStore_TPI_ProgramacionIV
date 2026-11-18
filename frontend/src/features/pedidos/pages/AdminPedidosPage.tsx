import ConfirmarAccion from "@/shared/components/ConfirmarAccion";
import { useState } from "react";
import { Cargando, ErrorMensaje, Vacio } from "@/shared/components/EstadoListado";
import DetallePedido from "../components/DetallePedido";
import PaginacionPedidos from "../components/PaginacionPedidos";
import TablaPedidos from "../components/TablaPedidos";
import { estados } from "../formato";
import { useCambiarEstadoPedido, usePedidos } from "../hooks/usePedidos";
import type { EstadoPedido } from "../types/pedido";

const limite = 20;
const opciones = Object.keys(estados) as EstadoPedido[];

export default function AdminPedidosPage() {
  const [pagina, setPagina] = useState(0);
  const [estado, setEstado] = useState<EstadoPedido>();
  const [detalleId, setDetalleId] = useState<number | null>(null);
  const [accion, setAccion] = useState<{ id: number; estado: "ENTREGADO" | "CANCELADO" } | null>(null);
  const pedidos = usePedidos({ skip: pagina * limite, limit: limite, estado }, false);
  const cambio = useCambiarEstadoPedido();

  function cambiar(id: number, estado: EstadoPedido) {
    if (cambio.isPending) return;
    if (estado === "CANCELADO" || estado === "ENTREGADO") {
      cambio.reset();
      setAccion({ id, estado });
      return;
    }
    cambio.mutate({ id, datos: { estado } });
  }

  return (
    <main className="mx-auto max-w-6xl space-y-5 px-6 py-10">
      <h1 className="text-3xl font-bold">Administrar pedidos</h1>
      <label className="block max-w-xs space-y-1 text-sm font-medium">
        <span>Filtrar por estado</span>
        <select className="campo selector-catalogo" value={estado ?? ""}
          onChange={(evento) => {
            setEstado(opciones.find((opcion) => opcion === evento.target.value));
            setPagina(0);
          }}>
          <option value="">Todos los estados</option>
          {opciones.map((opcion) => <option key={opcion} value={opcion}>{estados[opcion]}</option>)}
        </select>
      </label>
      {cambio.error && <ErrorMensaje mensaje={cambio.error.message} />}
      {pedidos.isPending ? <Cargando mensaje="Cargando pedidos…" /> :
        pedidos.isError ? <ErrorMensaje mensaje={pedidos.error.message} /> :
        pedidos.data?.items.length ? (
          <TablaPedidos pedidos={pedidos.data.items} ocupado={cambio.isPending} onDetalle={setDetalleId} onEstado={cambiar} />
        ) : <Vacio mensaje="No hay pedidos para los filtros actuales." />}
      <PaginacionPedidos pagina={pagina} limite={limite} total={pedidos.data?.total ?? 0}
        cargando={pedidos.isPending} onPagina={setPagina} />
      {accion && (
        <ConfirmarAccion titulo={accion.estado === "CANCELADO" ? `Cancelar pedido #${accion.id}` : "Confirmar entrega"}
          confirmar={accion.estado === "CANCELADO" ? "Cancelar pedido" : "Marcar como entregado"}
          cancelarTexto={accion.estado === "CANCELADO" ? "Volver" : "Cancelar"} peligro={accion.estado === "CANCELADO"}
          ocupado={cambio.isPending} error={cambio.error?.message} onCerrar={() => setAccion(null)}
          onConfirmar={async () => {
            try { await cambio.mutateAsync({ id: accion.id, datos: { estado: accion.estado } }); setAccion(null); }
            catch { /* El modal muestra el error y la consulta se refresca. */ }
          }}>
          {accion.estado === "CANCELADO" ? (
            <>
              <p>¿Querés cancelar este pedido?</p>
              <p>La cancelación restituirá el stock de sus productos y no podrá revertirse.</p>
            </>
          ) : <p>El pedido #{accion.id} pasará a ENTREGADO. Este estado es terminal y no puede revertirse.</p>}
        </ConfirmarAccion>
      )}
      {detalleId !== null && <DetallePedido id={detalleId} propio={false} onCerrar={() => setDetalleId(null)} />}
    </main>
  );
}
