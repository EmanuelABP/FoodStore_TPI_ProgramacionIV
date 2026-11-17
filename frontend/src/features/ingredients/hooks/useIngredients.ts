import { useQuery } from "@tanstack/react-query";
import { useCatalogo } from "@/shared/hooks/useCatalogo";
import { ingredienteApi } from "@/features/ingredients/services/ingrediente";

const clave = "ingredientes";

export function useIngredients() {
  return useCatalogo(clave, ingredienteApi);
}

export function useIngredientsList(enabled: boolean) {
  return useQuery({
    queryKey: [clave],
    queryFn: ({ signal }) => ingredienteApi.listar(signal),
    enabled,
  });
}
