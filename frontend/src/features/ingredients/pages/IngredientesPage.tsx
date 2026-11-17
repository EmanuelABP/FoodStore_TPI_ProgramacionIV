import type { ColumnDef } from "@tanstack/react-table";
import TablaCatalogo from "@/shared/components/TablaCatalogo";
import IngredienteModal from "@/features/ingredients/components/IngredienteModal";
import { Cargando, ErrorMensaje, Vacio } from "@/shared/components/EstadoListado";
import { useEsAdmin } from "@/features/auth";
import type { Ingrediente } from "@/features/ingredients/types/ingrediente";

const columnas: ColumnDef<Ingrediente>[] = [
  { accessorKey: "nombre", header: "Nombre" },
];

import { useIngredients } from "@/features/ingredients/hooks/useIngredients";

export default function IngredientesPage() {
  const esAdmin = useEsAdmin();
  const catalogo = useIngredients();
  const { listado } = catalogo;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Ingredientes</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Administrá los ingredientes del catálogo.</p>
        </div>
        {esAdmin && <button type="button" className="btn-primario" onClick={() => catalogo.abrir(null)}
          disabled={catalogo.ocupado}>+ Nuevo ingrediente</button>}
      </div>

      <div className="space-y-4">
        {catalogo.errorBaja && <ErrorMensaje mensaje={catalogo.errorBaja} />}
        {listado.isPending ? (
          <Cargando mensaje="Cargando ingredientes…" />
        ) : listado.isError ? (
          <ErrorMensaje mensaje={listado.error.message} />
        ) : listado.data.length === 0 ? (
          <Vacio mensaje="No hay ingredientes registrados." />
        ) : (
          <TablaCatalogo registros={listado.data} columnas={columnas} titulo="Ingredientes"
            ocupado={catalogo.ocupado} puedeEditar={esAdmin} onEditar={catalogo.abrir} onEliminar={catalogo.eliminar} />
        )}
      </div>
      {esAdmin && catalogo.abierto && (
        <IngredienteModal registro={catalogo.seleccionado} ocupado={catalogo.ocupado}
          error={catalogo.errorFormulario} onGuardar={catalogo.guardar} onCerrar={catalogo.cerrar} />
      )}
    </main>
  );
}
