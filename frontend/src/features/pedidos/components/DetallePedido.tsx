import { Cargando, ErrorMensaje } from "@/shared/components/EstadoListado";
import { fechaPedido, formasPago, importe } from "../formato";
import { useDetallePedido } from "../hooks/usePedidos";
import EstadoPedidoBadge from "./EstadoPedidoBadge";

interface Props {
  id: number;
  propio: boolean;
  onCerrar: () => void;
}

export default function DetallePedido({ id, propio, onCerrar }: Props) {
  const detalle = useDetallePedido(id, propio);
  const pedido = detalle.data;

  return (
    <section aria-label={`Detalle del pedido #${id}`} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Detalle del pedido #{id}</h2>
        <button type="button" className="btn-secundario" onClick={onCerrar}>Cerrar detalle</button>
      </div>
      {detalle.isPending ? <Cargando mensaje="Cargando detalle…" /> :
        detalle.isError ? <ErrorMensaje mensaje={detalle.error.message} /> : pedido && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <EstadoPedidoBadge estado={pedido.estado} />
              <span className="text-sm">{fechaPedido(pedido.created_at)}</span>
            </div>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div><dt className="font-semibold">Dirección de entrega</dt><dd className="break-words">{pedido.direccion_entrega}</dd></div>
              <div><dt className="font-semibold">Forma de pago</dt><dd>{formasPago[pedido.forma_pago]}</dd></div>
              {pedido.notas && <div className="sm:col-span-2"><dt className="font-semibold">Notas</dt><dd className="break-words">{pedido.notas}</dd></div>}
            </dl>
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap text-left text-sm" aria-label="Líneas del pedido">
                <thead className="bg-slate-100 dark:bg-slate-800">
                  <tr>
                    <th scope="col" className="px-3 py-2">Producto</th>
                    <th scope="col" className="px-3 py-2">Cantidad</th>
                    <th scope="col" className="px-3 py-2">Precio unitario</th>
                    <th scope="col" className="px-3 py-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {pedido.items.map((item) => (
                    <tr key={item.producto_id}>
                      <td className="px-3 py-2">{item.nombre_producto}</td>
                      <td className="px-3 py-2">{item.cantidad}</td>
                      <td className="px-3 py-2">{importe(item.precio_unitario)}</td>
                      <td className="px-3 py-2">{importe(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-right font-semibold">Total {importe(pedido.total)}</p>
          </>
        )}
    </section>
  );
}
