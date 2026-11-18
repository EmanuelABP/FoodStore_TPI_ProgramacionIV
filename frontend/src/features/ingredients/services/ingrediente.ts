import type { Ingrediente, IngredienteFormData } from "@/features/ingredients/types/ingrediente";
import { legacyCatalogoConfig } from "@/shared/api/api";
import { servicioCrud } from "@/shared/api/servicioCrud";

export const ingredienteApi = servicioCrud<Ingrediente, IngredienteFormData>("/ingredientes", legacyCatalogoConfig);
