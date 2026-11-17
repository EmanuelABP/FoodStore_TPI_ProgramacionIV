import { useQuery } from "@tanstack/react-query";
import { useCatalogo } from "@/shared/hooks/useCatalogo";
import { categoriaApi } from "@/features/categories/services/categoria";

const clave = "categorias";

export function useCategories() {
  return useCatalogo(clave, categoriaApi);
}

export function useCategoriesList(enabled: boolean) {
  return useQuery({
    queryKey: [clave],
    queryFn: ({ signal }) => categoriaApi.listar(signal),
    enabled,
  });
}
