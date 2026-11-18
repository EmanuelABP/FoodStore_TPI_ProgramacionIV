import { axiosInstance } from "@/shared/api/api";
import { conMensaje, servicioCrud } from "@/shared/api/servicioCrud";
import type {
  FiltrosProductos, ProductoCreate, ProductoRead, ProductosPaginados, ProductoStockUpdate,
} from "@/features/products/types/producto";

const ruta = "/productos";

export const productoApi = {
  ...servicioCrud<ProductoRead, ProductoCreate>(ruta),

  listar(params: FiltrosProductos, signal: AbortSignal): Promise<ProductosPaginados> {
    return conMensaje(async () => (await axiosInstance.get<ProductosPaginados>(ruta, { params, signal })).data);
  },
  actualizarStock(id: number, datos: ProductoStockUpdate): Promise<ProductoRead> {
    return conMensaje(async () => (await axiosInstance.patch<ProductoRead>(`${ruta}/${id}/stock`, datos)).data);
  },
};
