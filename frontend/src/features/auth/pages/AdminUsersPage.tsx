import { Cargando, ErrorMensaje, Vacio } from "@/shared/components/EstadoListado";
import { mensajeApi } from "@/shared/api/servicioCrud";

import { useAdminUsers } from "@/features/auth/hooks/useAdminUsers";

export default function AdminUsersPage() {
  const { usuarios, cambiarEstado } = useAdminUsers();

  return (
    <main className="mx-auto max-w-6xl space-y-5 px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Usuarios</h1>
      {cambiarEstado.isError && <ErrorMensaje mensaje={mensajeApi(cambiarEstado.error)} />}
      {usuarios.isPending ? <Cargando mensaje="Cargando usuarios…" /> :
        usuarios.isError ? <ErrorMensaje mensaje={mensajeApi(usuarios.error)} /> :
        usuarios.data.length === 0 ? <Vacio mensaje="No hay usuarios." /> : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800"><tr>
                <th className="p-3" scope="col">Nombre</th>
                <th className="p-3" scope="col">Email</th>
                <th className="p-3" scope="col">Roles</th>
                <th className="p-3" scope="col">Estado</th>
                <th className="p-3" scope="col">Acción</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {usuarios.data.map((usuario) => (
                  <tr key={usuario.id}>
                    <td className="p-3">{usuario.nombre} {usuario.apellido}</td>
                    <td className="p-3">{usuario.email}</td>
                    <td className="p-3">{usuario.roles.join(", ") || "—"}</td>
                    <td className="p-3">{usuario.deleted_at ? "Desactivado" : "Activo"}</td>
                    <td className="p-3">
                      <button className="btn-secundario" type="button" disabled={cambiarEstado.isPending}
                        onClick={() => cambiarEstado.mutate({ id: usuario.id, activo: Boolean(usuario.deleted_at) })}>
                        {usuario.deleted_at ? "Activar" : "Desactivar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </main>
  );
}
