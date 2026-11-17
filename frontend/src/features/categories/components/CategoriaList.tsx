import type { ColumnDef } from "@tanstack/react-table";
import TablaCatalogo from "@/shared/components/TablaCatalogo";
import type { Categoria } from "@/features/categories/types/categoria";

const columnas: ColumnDef<Categoria>[] = [
  { accessorKey: "nombre", header: "Nombre" },
  { accessorKey: "descripcion", header: "Descripción" },
];

interface CategoriaListProps {
  registros: Categoria[];
  ocupado: boolean;
  puedeEditar: boolean;
  onEditar: (registro: Categoria) => void;
  onEliminar: (id: number) => void;
}

export default function CategoriaList(props: CategoriaListProps) {
  return <TablaCatalogo columnas={columnas} titulo="Categorías" {...props} />;
}
