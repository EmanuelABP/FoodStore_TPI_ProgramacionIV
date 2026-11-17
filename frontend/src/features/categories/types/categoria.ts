export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  deleted_at: string | null;
}

export type CategoriaFormData = Omit<Categoria, "id" | "deleted_at">;