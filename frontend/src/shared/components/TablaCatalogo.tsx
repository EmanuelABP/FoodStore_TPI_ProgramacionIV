import { useState } from "react";
import type { ReactNode } from "react";
import {
  flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef, SortingState } from "@tanstack/react-table";

interface TablaProps<T extends { id: number }> {
  registros: T[];
  columnas: ColumnDef<T>[];
  titulo: string;
  ocupado: boolean;
  puedeEditar: boolean;
  onEditar: (registro: T) => void;
  onEliminar: (id: number) => void;
  accionesExtra?: (registro: T) => ReactNode;
}

export default function TablaCatalogo<T extends { id: number }>({
  registros, columnas, titulo, ocupado, puedeEditar, onEditar, onEliminar, accionesExtra,
}: TablaProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  // TanStack Table v8 maneja su propio estado de tabla.
  // eslint-disable-next-line react-hooks/incompatible-library
  const tabla = useReactTable({
    data: registros,
    columns: columnas,
    getRowId: (registro) => String(registro.id),
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
  });

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table aria-label={titulo} className="w-full text-left text-sm text-slate-800 dark:text-slate-200">
          <thead className="bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">
            {tabla.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id}>
                {grupo.headers.map((header) => {
                  const orden = header.column.getIsSorted();
                  return (
                    <th key={header.id} className="px-4 py-3" scope="col"
                      aria-sort={orden === "asc" ? "ascending" : orden === "desc" ? "descending" : "none"}>
                      <button type="button" className="rounded px-1 hover:bg-slate-200 dark:hover:bg-slate-700"
                        onClick={header.column.getToggleSortingHandler()}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <span aria-hidden="true"> {orden === "asc" ? "↑" : orden === "desc" ? "↓" : "↕"}</span>
                      </button>
                    </th>
                  );
                })}
                {puedeEditar && <th className="px-4 py-3" scope="col">Acciones</th>}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {tabla.getRowModel().rows.map((fila) => (
              <tr key={fila.id}>
                {fila.getVisibleCells().map((celda) => (
                  <td key={celda.id} className="break-words px-4 py-3">
                    {flexRender(celda.column.columnDef.cell, celda.getContext())}
                  </td>
                ))}
                {puedeEditar && <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button className="btn-secundario" disabled={ocupado} type="button"
                      onClick={() => onEditar(fila.original)}>Editar</button>
                    <button className="btn-secundario text-red-700 dark:text-red-300" disabled={ocupado} type="button"
                      onClick={() => onEliminar(fila.original.id)}>Dar de baja</button>
                    {accionesExtra?.(fila.original)}
                  </div>
                </td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm dark:border-slate-700">
        <span>Página {tabla.getState().pagination.pageIndex + 1} de {tabla.getPageCount()}</span>
        <div className="flex gap-2">
          <button type="button" className="btn-secundario" onClick={() => tabla.previousPage()}
            disabled={!tabla.getCanPreviousPage()}>Anterior</button>
          <button type="button" className="btn-secundario" onClick={() => tabla.nextPage()}
            disabled={!tabla.getCanNextPage()}>Siguiente</button>
        </div>
      </div>
    </div>
  );
}
