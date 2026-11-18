import type { Categoria, CategoriaFormData } from "@/features/categories/types/categoria";
import { legacyCatalogoConfig } from "@/shared/api/api";
import { servicioCrud } from "@/shared/api/servicioCrud";

export const categoriaApi = servicioCrud<Categoria, CategoriaFormData>("/categorias/", legacyCatalogoConfig);
