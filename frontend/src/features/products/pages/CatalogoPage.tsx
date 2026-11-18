import { useState } from "react";
import { useCategoriesList } from "@/features/categories";
import ProductoCard from "@/features/products/components/ProductoCard";
import { useProductosPublicos } from "@/features/products/hooks/useProducts";
import { ErrorMensaje, Vacio } from "@/shared/components/EstadoListado";

const limit = 6;

function CatalogoSkeleton() {
  return (
    <div role="status">
      <span className="sr-only">Cargando productos…</span>
      <div aria-hidden="true" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: limit }, (_, index) => (
          <div key={index} className="h-64 rounded-xl border border-slate-200 bg-white p-5 motion-safe:animate-pulse dark:border-slate-700 dark:bg-slate-900">
            <div className="h-32 rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="mt-4 h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-3 h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CatalogoPage() {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | undefined>();
  const [pagina, setPagina] = useState(0);
  const categorias = useCategoriesList();
  const productos = useProductosPublicos({
    skip: pagina * limit, limit, search: busqueda.trim() || undefined, categoria_id: categoriaId,
  });
  const total = productos.data?.total ?? 0;

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
      <h1 className="text-3xl font-bold">Catálogo</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1 text-sm font-medium">
          <span>Buscar productos</span>
          <input type="search" className="campo" value={busqueda}
            onChange={(evento) => { setBusqueda(evento.target.value); setPagina(0); }} />
        </label>
        <label className="block space-y-1 text-sm font-medium">
          <span>Categoría</span>
          <select value={categoriaId ?? ""} className="campo selector-catalogo" disabled={categorias.isPending}
            onChange={(evento) => {
              setCategoriaId(evento.target.value ? Number(evento.target.value) : undefined);
              setPagina(0);
            }}>
            <option value="">Todas las categorías</option>
            {categorias.data?.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>)}
          </select>
        </label>
      </div>
      {categorias.isError && <ErrorMensaje mensaje={categorias.error.message} />}

      {productos.isPending ? <CatalogoSkeleton /> :
        productos.isError ? <ErrorMensaje mensaje={productos.error.message} /> :
        productos.data.items.length === 0 ? <Vacio mensaje="No se encontraron productos." /> : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {productos.data.items.map((producto) => <ProductoCard key={producto.id} producto={producto} />)}
          </div>
        )}

      {(pagina > 0 || total > limit) && (
        <nav aria-label="Paginación del catálogo" className="flex items-center justify-between gap-3">
          <button type="button" className="btn-secundario" disabled={pagina === 0 || productos.isPending}
            onClick={() => setPagina((actual) => actual - 1)}>Anterior</button>
          <span className="text-sm">Página {pagina + 1}</span>
          <button type="button" className="btn-secundario"
            disabled={productos.isPending || (pagina + 1) * limit >= total}
            onClick={() => setPagina((actual) => actual + 1)}>Siguiente</button>
        </nav>
      )}
    </main>
  );
}
