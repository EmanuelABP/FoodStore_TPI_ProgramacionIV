import type { CategoriaRead } from "@/features/categories";

export interface ProductoRead {
  id: number;
  categoria_id: number;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagen_url: string | null;
  stock: number;
  disponible: boolean;
  activo: boolean;
  categoria: CategoriaRead;
}

export interface ProductoCreate {
  nombre: string;
  descripcion?: string | null;
  precio_base: number;
  imagen_url?: string | null;
  stock?: number;
  disponible?: boolean;
  categoria_id: number;
}

export type ProductoUpdate = Partial<ProductoCreate>;
export type ProductoStockUpdate = Pick<ProductoRead, "stock" | "disponible">;

export interface ProductosPaginados {
  total: number;
  items: ProductoRead[];
}

export interface FiltrosProductos {
  skip: number;
  limit: number;
  search?: string;
  categoria_id?: number;
  disponible?: boolean;
}
