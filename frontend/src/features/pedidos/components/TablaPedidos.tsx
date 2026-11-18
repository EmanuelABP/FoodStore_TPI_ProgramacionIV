import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { estados, fechaPedido, importe, transiciones } from "../formato";
import type { EstadoPedido, PedidoRead } from "../types/pedido";
import EstadoPedidoBadge from "./EstadoPedidoBadge";

interface Props {
  pedidos: PedidoRead[];
  ocupado: boolean;
  onDetalle: (id: number) => void;
  onEstado: (id: number, estado: EstadoPedido) => void;
}

export default function TablaPedidos({ pedidos, ocupado, onDetalle, onEstado }: Props) {
  const columnas: ColumnDef<PedidoRead>[] = [
    { accessorKey: "id", header: "Pedido", cell: ({ row }) => `#${row.original.id}` },
    { accessorKey: "usuario_id", header: "Usuario", cell: ({ row }) => `#${row.original.usuario_id}` },
    { accessorKey: "created_at", header: "Fecha", cell: ({ row }) => fechaPedido(row.original.created_at) },
    { accessorKey: "estado", header: "Estado", cell: ({ row }) => <EstadoPedidoBadge estado={row.original.estado} /> },
    { accessorKey: "total", header: "Total", cell: ({ row }) => importe(row.original.total) },
    {
      id: "acciones", header: "Acciones",
      cell: ({ row: { original: pedido } }) => (
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secundario" onClick={() => onDetalle(pedido.id)}>Ver detalle</button>
          {transiciones[pedido.estado].map((destino) => (
            <button type="button" className="btn-secundario" key={destino} disabled={ocupado}
              onClick={() => onEstado(pedido.id, destino)}>
              {destino === "CANCELADO" ? "Cancelar pedido" : `Pasar a ${estados[destino].toLowerCase()}`}
            </button>
          ))}
        </div>
      ),
    },
  ];
  // TanStack Table v8 maneja su propio estado de tabla.
  // eslint-disable-next-line react-hooks/incompatible-library
  const tabla = useReactTable({
    data: pedidos, columns: columnas, getRowId: (pedido) => String(pedido.id),
    getCoreRowModel: getCoreRowModel(), manualPagination: true,
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <table className="w-full text-left text-sm" aria-label="Administración de pedidos">
        <thead className="bg-slate-100 dark:bg-slate-800">
          {tabla.getHeaderGroups().map((grupo) => (
            <tr key={grupo.id}>
              {grupo.headers.map((cabecera) => (
                <th scope="col" key={cabecera.id} className="px-3 py-3">
                  {flexRender(cabecera.column.columnDef.header, cabecera.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {tabla.getRowModel().rows.map((fila) => (
            <tr key={fila.id}>
              {fila.getVisibleCells().map((celda) => (
                <td className="px-3 py-3" key={celda.id}>
                  {flexRender(celda.column.columnDef.cell, celda.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
