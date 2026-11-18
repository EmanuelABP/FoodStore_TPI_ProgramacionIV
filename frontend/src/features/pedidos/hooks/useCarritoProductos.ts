import axios from "axios";
import { queryOptions, useQueries } from "@tanstack/react-query";
import { productoApi } from "@/features/products";
import type { ProductoRead } from "@/features/products";
import type { CartItem } from "@/store/cartStore";

export function productoCarritoQuery(id: number) {
  return queryOptions({
    queryKey: ["productos", "detalle", id],
    queryFn: async ({ signal }) => {
      try {
        return await productoApi.obtener(id, signal);
      } catch (error) {
        if (error instanceof Error && axios.isAxiosError(error.cause) && error.cause.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    retry: false,
  });
}

export function problemaStock(item: CartItem, producto: ProductoRead | null): string | undefined {
  if (!producto?.activo || !producto.disponible) return "El producto ya no está disponible.";
  if (item.cantidad > producto.stock) {
    return producto.stock === 0 ? "El producto está sin stock." : `Stock actual: ${producto.stock}.`;
  }
}

export function useCarritoProductos(items: CartItem[]) {
  const consultas = useQueries({ queries: items.map((item) => productoCarritoQuery(item.producto_id)) });
  const lineas = items.map((item, indice) => {
    const consulta = consultas[indice];
    const producto = consulta.data ?? null;
    const problema = consulta.isError
      ? consulta.error.message
      : consulta.isSuccess ? problemaStock(item, producto) : undefined;
    return { item, producto, problema };
  });

  return {
    lineas,
    cargando: consultas.some((consulta) => consulta.isPending),
    valido: consultas.every((consulta, indice) =>
      consulta.isSuccess && !problemaStock(items[indice], consulta.data)),
    totalEstimado: lineas.reduce((total, { item, producto }) =>
      total + (producto?.precio_base ?? item.precio_unitario) * item.cantidad, 0),
  };
}
