import { useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCategoriesList } from "@/features/categories";
import { useIngredientsList } from "@/features/ingredients";
import { useCatalogo } from "@/shared/hooks/useCatalogo";
import { productoApi } from "@/features/products/services/producto";
import type { Producto, ProductoCategoriaDatos, ProductoFormulario } from "@/features/products/types/producto";

export function useProducts(esAdmin: boolean) {
  const cliente = useQueryClient();
  const idAlta = useRef<number | null>(null);

  async function guardarCategorias(producto: Producto, categorias: ProductoCategoriaDatos[]) {
    try {
      return await productoApi.guardarCategorias(producto, categorias);
    } catch (error) {
      await cliente.invalidateQueries({ queryKey: ["productos"] });
      throw error;
    }
  }

  const catalogo = useCatalogo("productos", {
    ...productoApi,
    async crear({ categorias, ...datos }: ProductoFormulario) {
      const producto = idAlta.current === null
        ? await productoApi.crear(datos)
        : await productoApi.actualizar(idAlta.current, datos);
      // Si falla una asociación, el próximo Guardar continúa sobre el producto creado.
      idAlta.current = producto.id;
      return guardarCategorias(producto, categorias);
    },
    async actualizar(id, { categorias, ...datos }: ProductoFormulario) {
      return guardarCategorias(await productoApi.actualizar(id, datos), categorias);
    },
  });
  const ingredientes = useIngredientsList(esAdmin && catalogo.abierto);
  const categorias = useCategoriesList(esAdmin && catalogo.abierto);

  function abrirProducto(producto: Producto | null) {
    idAlta.current = null;
    catalogo.abrir(producto);
  }


  return { catalogo, ingredientes, categorias, abrirProducto };
}
