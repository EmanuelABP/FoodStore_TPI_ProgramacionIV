import type { Ingrediente, IngredienteFormData } from "@/features/ingredients/types/ingrediente";
import { servicioCrud } from "@/shared/api/servicioCrud";

export const ingredienteApi = servicioCrud<Ingrediente, IngredienteFormData>("/ingredientes");
