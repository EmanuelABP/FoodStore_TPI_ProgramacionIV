import type { Categoria, CategoriaFormData } from "@/features/categories/types/categoria";
import { servicioCrud } from "@/shared/api/servicioCrud";

export const categoriaApi = servicioCrud<Categoria, CategoriaFormData>("/categorias/");
