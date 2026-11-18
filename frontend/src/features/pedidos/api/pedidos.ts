import { axiosInstance } from "@/shared/api/api";
import { conMensaje } from "@/shared/api/servicioCrud";
import type {
  CambioEstado, FiltrosPedidos, PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos,
} from "../types/pedido";

const ruta = "/pedidos";

export const pedidosApi = {
  listar(params: FiltrosPedidos, signal: AbortSignal) {
    return conMensaje(async () => (await axiosInstance.get<PedidosPaginados>(ruta, { params, signal })).data);
  },
  detalle(id: number, signal: AbortSignal) {
    return conMensaje(async () => (await axiosInstance.get<PedidoRead>(`${ruta}/${id}`, { signal })).data);
  },
  crear(datos: PedidoCreate) {
    return conMensaje(async () => (await axiosInstance.post<PedidoRead>(ruta, datos)).data);
  },
  cambiarEstado(id: number, datos: CambioEstado) {
    return conMensaje(async () => (await axiosInstance.patch<PedidoRead>(`${ruta}/${id}/estado`, datos)).data);
  },
  cancelar(id: number) {
    return conMensaje(async () => (await axiosInstance.patch<PedidoRead>(`${ruta}/${id}/cancelar`)).data);
  },
  resumen(signal: AbortSignal) {
    return conMensaje(async () => (await axiosInstance.get<ResumenPedidos>(`${ruta}/resumen`, { signal })).data);
  },
};
