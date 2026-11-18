import { useState } from "react";
import ConfirmarAccion from "@/shared/components/ConfirmarAccion";
import type { CategoriaRead } from "@/features/categories/types/categoria";
import CategoriaList from "@/features/categories/components/CategoriaList";
import CategoriaModal from "@/features/categories/components/CategoriaModal";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { Cargando, ErrorMensaje, Vacio } from "@/shared/components/EstadoListado";

export default function AdminCategoriasPage() {
  const catalogo = useCategories();
  const { listado } = catalogo;
  const [baja, setBaja] = useState<CategoriaRead | null>(null);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Administrar categorías</h1>
        <button type="button" className="btn-primario" onClick={() => { void catalogo.abrir(null); }}
          disabled={catalogo.ocupado}>+ Nueva categoría</button>
      </div>

      <div className="space-y-4">
        {catalogo.cargandoDetalle && <Cargando mensaje="Cargando categoría…" />}
        {catalogo.errorDetalle && <ErrorMensaje mensaje={catalogo.errorDetalle} />}
        {catalogo.errorBaja && <ErrorMensaje mensaje={catalogo.errorBaja} />}
        {listado.isPending ? <Cargando mensaje="Cargando categorías…" /> :
          listado.isError ? <ErrorMensaje mensaje={listado.error.message} /> :
          listado.data.length === 0 ? <Vacio mensaje="No hay categorías activas." /> : (
            <CategoriaList registros={listado.data}
              ocupado={catalogo.ocupado} puedeEditar onEditar={catalogo.abrir} onEliminar={(id) => setBaja(listado.data?.find((categoria) => categoria.id === id) ?? null)} />
          )}
      </div>
      {baja && (
        <ConfirmarAccion titulo="Dar de baja categoría" confirmar="Dar de baja" peligro
          onCerrar={() => setBaja(null)}
          onConfirmar={() => { catalogo.eliminar(baja.id, true); setBaja(null); }}>
          <p>Se desactivará la categoría <strong className="break-words">{baja.nombre}</strong>.</p>
          <p>Los productos activos de esta categoría seguirán visibles en el catálogo general.</p>
        </ConfirmarAccion>
      )}
      {catalogo.abierto && (
        <CategoriaModal registro={catalogo.seleccionado} ocupado={catalogo.ocupado}
          error={catalogo.errorFormulario} onGuardar={catalogo.guardar} onCerrar={catalogo.cerrar} />
      )}
    </main>
  );
}
