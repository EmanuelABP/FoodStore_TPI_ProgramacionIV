import { estados } from "../formato";
import type { EstadoPedido } from "../types/pedido";

const colores: Record<EstadoPedido, string> = {
  PENDIENTE: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  EN_PREPARACION: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
  ENTREGADO: "bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-200",
  CANCELADO: "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100",
};

export default function EstadoPedidoBadge({ estado }: { estado: EstadoPedido }) {
  return <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${colores[estado]}`}>{estados[estado]}</span>;
}
