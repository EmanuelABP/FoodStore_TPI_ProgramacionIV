import ConfirmarAccion from "@/shared/components/ConfirmarAccion";
import { useMemo, useState } from "react";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Cargando, ErrorMensaje, Vacio } from "@/shared/components/EstadoListado";
import { mensajeApi } from "@/shared/api/servicioCrud";
import { useAdminUsers } from "@/features/auth/hooks/useAdminUsers";
import type { UserPublic } from "@/features/auth/types/auth.types";

interface TablaUsuariosProps {
  usuarios: UserPublic[];
  idActual: number | undefined;
  ocupado: boolean;
  onCambiarEstado: (datos: { id: number; activo: boolean }) => void;
}

function TablaUsuarios({ usuarios, idActual, ocupado, onCambiarEstado }: TablaUsuariosProps) {
  const columnas = useMemo<ColumnDef<UserPublic>[]>(() => [
    { accessorKey: "username", header: "Usuario" },
    { accessorKey: "full_name", header: "Nombre completo" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "role", header: "Rol" },
    { accessorKey: "disabled", header: "Estado", cell: ({ row }) => (
      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${row.original.disabled
        ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200"
        : "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200"}`}>
        {row.original.disabled ? "Desactivado" : "Activo"}
      </span>
    ) },
    {
      id: "accion",
      header: "Acción",
      cell: ({ row }) => {
        const usuario = row.original;
        if (!usuario.disabled && usuario.id === idActual) return null;

        return (
          <button className={`btn-secundario w-28 text-center ${usuario.disabled ? "btn-exito" : "btn-peligro"}`} type="button" disabled={ocupado}
            onClick={() => onCambiarEstado({ id: usuario.id, activo: usuario.disabled })}>
            {usuario.disabled ? "Activar" : "Desactivar"}
          </button>
        );
      },
    },
  ], [idActual, ocupado, onCambiarEstado]);

  // TanStack Table v8 maneja su propio estado.
  // eslint-disable-next-line react-hooks/incompatible-library
  const tabla = useReactTable({
    data: usuarios,
    columns: columnas,
    getRowId: (usuario) => String(usuario.id),
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <table aria-label="Usuarios" className="w-full text-left text-sm">
        <thead className="bg-slate-100 dark:bg-slate-800">
          {tabla.getHeaderGroups().map((grupo) => (
            <tr key={grupo.id}>
              {grupo.headers.map((header) => (
                <th key={header.id} className="p-3" scope="col">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {tabla.getRowModel().rows.map((fila) => (
            <tr key={fila.id}>
              {fila.getVisibleCells().map((celda) => (
                <td key={celda.id} className="p-3">
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

export default function AdminUsersPage() {
  const { usuarios, cambiarEstado, idActual } = useAdminUsers();
  const [desactivar, setDesactivar] = useState<UserPublic | null>(null);

  function solicitarCambio(datos: { id: number; activo: boolean }) {
    if (cambiarEstado.isPending) return;
    if (datos.activo) { cambiarEstado.mutate(datos); return; }
    cambiarEstado.reset();
    setDesactivar(usuarios.data?.find((usuario) => usuario.id === datos.id) ?? null);
  }

  return (
    <main className="mx-auto max-w-6xl space-y-5 px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Usuarios</h1>
      {cambiarEstado.isError && <ErrorMensaje mensaje={mensajeApi(cambiarEstado.error)} />}
      {usuarios.isPending ? <Cargando mensaje="Cargando usuarios…" /> :
        usuarios.isError ? <ErrorMensaje mensaje={mensajeApi(usuarios.error)} /> :
        usuarios.data.length === 0 ? <Vacio mensaje="No hay usuarios." /> : (
          <TablaUsuarios usuarios={usuarios.data} idActual={idActual} ocupado={cambiarEstado.isPending}
            onCambiarEstado={solicitarCambio} />
        )}
      {desactivar && (
        <ConfirmarAccion titulo="Desactivar usuario" confirmar="Desactivar" peligro
          ocupado={cambiarEstado.isPending} error={cambiarEstado.error ? mensajeApi(cambiarEstado.error) : undefined}
          onCerrar={() => setDesactivar(null)}
          onConfirmar={async () => {
            try { await cambiarEstado.mutateAsync({ id: desactivar.id, activo: false }); setDesactivar(null); }
            catch { /* El modal muestra el error de la operación. */ }
          }}>
          <p>¿Querés desactivar la cuenta de <strong className="break-words">{desactivar.full_name} ({desactivar.username})</strong>?</p>
          <p>El usuario no podrá autenticarse mientras su cuenta permanezca desactivada.</p>
        </ConfirmarAccion>
      )}
    </main>
  );
}
