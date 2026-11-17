import type { ColumnDef } from "@tanstack/react-table";
import TablaCatalogo from "@/shared/components/TablaCatalogo";
import ProductoModal from "@/features/products/components/ProductoModal";
import { Cargando, ErrorMensaje, Vacio } from "@/shared/components/EstadoListado";
import { useEsAdmin } from "@/features/auth";
import type { Producto } from "@/features/products/types/producto";

import { useProducts } from "@/features/products/hooks/useProducts";

const columnas: ColumnDef<Producto>[] = [
  { accessorFn: (producto) => producto.categorias.map((categoria) => categoria.nombre).join(", "),
    id: "categorias", header: "Categorías", cell: ({ row }) => row.original.categorias
      .map((categoria) => categoria.es_principal ? categoria.nombre + " (principal)" : categoria.nombre)
      .join(", ") || "—" },
  { accessorKey: "nombre", header: "Nombre" },
  { accessorKey: "descripcion", header: "Descripción" },
  { accessorKey: "precio_base", header: "Precio base",
    cell: ({ row }) => row.original.precio_base.toLocaleString("es-AR", { style: "currency", currency: "ARS" }) },
  { accessorKey: "disponible", header: "Disponible", cell: ({ row }) => row.original.disponible ? "Sí" : "No" },
];

export default function ProductsPage() {
  const esAdmin = useEsAdmin();
  const { catalogo, ingredientes, categorias, abrirProducto } = useProducts(esAdmin);
  const { listado } = catalogo;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Productos</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Administrá los productos del catálogo.</p>
        </div>
        {esAdmin && <button type="button" className="btn-primario" onClick={() => abrirProducto(null)}
          disabled={catalogo.ocupado}>+ Nuevo producto</button>}
      </div>

      <div className="space-y-4">
        {catalogo.errorBaja && <ErrorMensaje mensaje={catalogo.errorBaja} />}
        {listado.isPending ? (
          <Cargando mensaje="Cargando productos…" />
        ) : listado.isError ? (
          <ErrorMensaje mensaje={listado.error.message} />
        ) : listado.data.length === 0 ? (
          <Vacio mensaje="No hay productos registrados." />
        ) : (
          <TablaCatalogo registros={listado.data} columnas={columnas} titulo="Productos"
            ocupado={catalogo.ocupado} puedeEditar={esAdmin} onEditar={abrirProducto} onEliminar={catalogo.eliminar} />
        )}
      </div>
      {esAdmin && catalogo.abierto && (
        <ProductoModal registro={catalogo.seleccionado} ocupado={catalogo.ocupado}
          ingredientes={ingredientes.data ?? []} cargandoIngredientes={ingredientes.isPending}
          errorIngredientes={ingredientes.error?.message}
          categorias={categorias.data ?? []} cargandoCategorias={categorias.isPending}
          errorCategorias={categorias.error?.message}
          error={catalogo.errorFormulario} onGuardar={catalogo.guardar} onCerrar={catalogo.cerrar} />
      )}
    </main>
  );
}
