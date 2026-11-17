import { axiosInstance } from "@/shared/api/api";
import type { Producto, ProductoCategoriaDatos, ProductoDatos } from "@/features/products/types/producto";
import { mensajeApi, servicioCrud } from "@/shared/api/servicioCrud";

export const productoApi = {
  ...servicioCrud<Producto, ProductoDatos>("/productos/"),

  async guardarCategorias(producto: Producto, seleccionadas: ProductoCategoriaDatos[]): Promise<Producto> {
    const ruta = `/productos/${producto.id}/categorias`;
    const actuales = new Set(producto.categorias.map(({ id }) => id));
    const porId = new Map(seleccionadas.map((categoria) => [categoria.categoria_id, categoria]));
    const tienePrincipal = seleccionadas.some(({ es_principal }) => es_principal);
    let huboCambios = false;

    try {
      for (const { id, es_principal } of producto.categorias) {
        const seleccionada = porId.get(id);
        // El POST rechaza vínculos duplicados. Al asignar una principal, la API desmarca la anterior.
        const cambiarPrincipal = seleccionada
          && seleccionada.es_principal !== es_principal
          && (seleccionada.es_principal || !tienePrincipal);
        if (!seleccionada || cambiarPrincipal) {
          await axiosInstance.delete(`${ruta}/${id}`);
          actuales.delete(id);
          huboCambios = true;
        }
      }
      for (const categoria of seleccionadas) {
        if (!actuales.has(categoria.categoria_id)) {
          await axiosInstance.post(ruta, categoria);
          huboCambios = true;
        }
      }
      if (!huboCambios) return producto;
      return { ...producto, categorias: (await axiosInstance.get<Producto["categorias"]>(ruta)).data };
    } catch (error) {
      throw new Error("El producto se guardó, pero faltó completar la asignación de categorías. " + mensajeApi(error), {
        cause: error,
      });
    }
  },
};
