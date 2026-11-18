import type { ColumnDef } from "@tanstack/react-table";
import TablaCatalogo from "@/shared/components/TablaCatalogo";
import type { CategoriaRead } from "@/features/categories/types/categoria";

const columnas: ColumnDef<CategoriaRead>[] = [
  { accessorKey: "nombre", header: "Nombre" },
  { accessorKey: "descripcion", header: "Descripción", cell: ({ row }) => row.original.descripcion || "—" },
];

interface CategoriaListProps {
  registros: CategoriaRead[];
  ocupado: boolean;
  puedeEditar: boolean;
  onEditar: (registro: CategoriaRead) => void;
  onEliminar: (id: number) => void;
}

export default function CategoriaList(props: CategoriaListProps) {
  return <TablaCatalogo columnas={columnas} titulo="Categorías" {...props} />;
}
