import type { EstadoPedido, FormaPago } from "./types/pedido";

const moneda = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });
const fecha = new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" });

export const importe = (valor: number) => moneda.format(valor);
export const fechaPedido = (valor: string) => fecha.format(new Date(valor));

export const estados: Record<EstadoPedido, string> = {
  PENDIENTE: "Pendiente",
  EN_PREPARACION: "En preparación",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export const formasPago: Record<FormaPago, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
};

export const transiciones: Record<EstadoPedido, readonly EstadoPedido[]> = {
  PENDIENTE: ["EN_PREPARACION", "CANCELADO"],
  EN_PREPARACION: ["ENTREGADO", "CANCELADO"],
  ENTREGADO: [],
  CANCELADO: [],
};
