import type { Categoria } from "@/features/categories";

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio_base: number;
  imagenes_url: string[];
  disponible: boolean;
  ingrediente_ids: number[];
  categorias: Array<Categoria & { es_principal: boolean }>;
}

export type ProductoDatos = Omit<Producto, "id" | "categorias">;

export interface ProductoCategoriaDatos {
  categoria_id: number;
  es_principal: boolean;
}

export type ProductoFormulario = ProductoDatos & { categorias: ProductoCategoriaDatos[] };
