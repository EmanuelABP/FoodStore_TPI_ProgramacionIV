import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCatalogo } from "@/shared/hooks/useCatalogo";
import { notificarError } from "@/shared/api/notificarError";
import { useNotificationStore } from "@/store/notificationStore";
import { productoApi } from "@/features/products/services/producto";
import type {
  FiltrosProductos, ProductoCreate, ProductoRead, ProductoStockUpdate,
} from "@/features/products/types/producto";

const clave = "productos";
const servicioAdmin = {
  ...productoApi,
  listar: async (signal: AbortSignal) => (await productoApi.listar({ skip: 0, limit: 100 }, signal)).items,
};

export function useProductosPublicos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: [clave, "publico", filtros],
    queryFn: ({ signal }) => productoApi.listar(filtros, signal),
  });
}

export function useProducts() {
  const catalogo = useCatalogo<ProductoRead, ProductoCreate>(clave, servicioAdmin);
  const [productoStock, setProductoStock] = useState<ProductoRead | null>(null);
  const cliente = useQueryClient();
  const stock = useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoStockUpdate }) => productoApi.actualizarStock(id, datos),
    onSuccess: async () => {
      await cliente.invalidateQueries({ queryKey: [clave] });
      setProductoStock(null);
      useNotificationStore.getState().showNotification("Stock y disponibilidad actualizados.");
    },
    onError: (error: Error) => notificarError(error),
  });

  function abrirStock(producto: ProductoRead) {
    stock.reset();
    setProductoStock(producto);
  }

  function cerrarStock() {
    setProductoStock(null);
    stock.reset();
  }

  function guardarStock(datos: ProductoStockUpdate) {
    if (productoStock && !stock.isPending) stock.mutate({ id: productoStock.id, datos });
  }

  return {
    catalogo, productoStock, abrirStock, cerrarStock, guardarStock,
    guardandoStock: stock.isPending, errorStock: stock.error?.message,
  };
}
