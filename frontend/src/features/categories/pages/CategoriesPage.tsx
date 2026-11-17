import CategoriaList from "@/features/categories/components/CategoriaList";
import CategoriaModal from "@/features/categories/components/CategoriaModal";
import { Cargando, ErrorMensaje, Vacio } from "@/shared/components/EstadoListado";
import { useEsAdmin } from "@/features/auth";

import { useCategories } from "@/features/categories/hooks/useCategories";

export default function CategoriesPage() {
  const esAdmin = useEsAdmin();
  const catalogo = useCategories();
  const { listado } = catalogo;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Categorías</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Administrá las categorías de productos.</p>
        </div>
        {esAdmin && <button type="button" className="btn-primario" onClick={() => catalogo.abrir(null)}
          disabled={catalogo.ocupado}>+ Nueva categoría</button>}
      </div>

      <div className="space-y-4">
        {catalogo.errorBaja && <ErrorMensaje mensaje={catalogo.errorBaja} />}
        {listado.isPending ? (
          <Cargando mensaje="Cargando categorías…" />
        ) : listado.isError ? (
          <ErrorMensaje mensaje={listado.error.message} />
        ) : listado.data.length === 0 ? (
          <Vacio mensaje="No hay categorías registradas." />
        ) : (
          <CategoriaList registros={listado.data}
            ocupado={catalogo.ocupado} puedeEditar={esAdmin} onEditar={catalogo.abrir} onEliminar={catalogo.eliminar} />
        )}
      </div>
      {esAdmin && catalogo.abierto && (
        <CategoriaModal registro={catalogo.seleccionado} ocupado={catalogo.ocupado}
          error={catalogo.errorFormulario} onGuardar={catalogo.guardar} onCerrar={catalogo.cerrar} />
      )}
    </main>
  );
}
