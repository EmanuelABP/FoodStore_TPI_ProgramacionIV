import type { CategoriaCreate, CategoriaRead } from "@/features/categories/types/categoria";
import { servicioCrud } from "@/shared/api/servicioCrud";

export const categoriaApi = servicioCrud<CategoriaRead, CategoriaCreate>("/categorias");
