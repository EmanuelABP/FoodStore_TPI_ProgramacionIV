import { useQuery } from "@tanstack/react-query";
import { useCatalogo } from "@/shared/hooks/useCatalogo";
import { categoriaApi } from "@/features/categories/services/categoria";
import type { CategoriaCreate, CategoriaRead } from "@/features/categories/types/categoria";

const clave = "categorias";

export function useCategories() {
  return useCatalogo<CategoriaRead, CategoriaCreate>(clave, categoriaApi, ["productos"]);
}

export function useCategoriesList(enabled = true) {
  return useQuery({
    queryKey: [clave, "lista"],
    queryFn: ({ signal }) => categoriaApi.listar(signal),
    enabled,
  });
}
