import { useState } from "react";
import ConfirmarAccion from "@/shared/components/ConfirmarAccion";
import ProductoImagen from "../components/ProductoImagen";
import type { ColumnDef } from "@tanstack/react-table";
import { useCategoriesList } from "@/features/categories";
import TablaCatalogo from "@/shared/components/TablaCatalogo";
import ProductoModal, { StockModal } from "@/features/products/components/ProductoModal";
import { Cargando, ErrorMensaje, Vacio } from "@/shared/components/EstadoListado";
import type { ProductoRead } from "@/features/products/types/producto";
import { useProducts } from "@/features/products/hooks/useProducts";

const columnas: ColumnDef<ProductoRead>[] = [
  { id: "imagen", header: "Imagen", enableSorting: false,
    cell: ({ row }) => <ProductoImagen url={row.original.imagen_url} nombre={row.original.nombre} miniatura /> },
  { accessorKey: "nombre", header: "Nombre" },
  { accessorFn: (producto) => producto.categoria.nombre, id: "categoria", header: "Categoría",
    cell: ({ row }) => row.original.categoria.nombre + (row.original.categoria.activo ? "" : " (inactiva)") },
  { accessorKey: "descripcion", header: "Descripción", cell: ({ row }) => row.original.descripcion || "—" },
  { accessorKey: "precio_base", header: "Precio base",
    cell: ({ row }) => row.original.precio_base.toLocaleString("es-AR", { style: "currency", currency: "ARS" }) },
  { accessorKey: "stock", header: "Stock" },
  { accessorKey: "disponible", header: "Disponible", cell: ({ row }) => row.original.disponible ? "Sí" : "No" },
];

export default function AdminProductosPage() {
  const { catalogo, productoStock, abrirStock, cerrarStock, guardarStock, guardandoStock, errorStock } = useProducts();
  const { listado } = catalogo;
  const [baja, setBaja] = useState<ProductoRead | null>(null);
  const categorias = useCategoriesList(catalogo.abierto);
  const ocupado = catalogo.ocupado || guardandoStock;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Administrar productos</h1>
        <button type="button" className="btn-primario" onClick={() => { void catalogo.abrir(null); }}
          disabled={ocupado}>+ Nuevo producto</button>
      </div>

      <div className="space-y-4">
        {catalogo.cargandoDetalle && <Cargando mensaje="Cargando producto…" />}
        {catalogo.errorDetalle && <ErrorMensaje mensaje={catalogo.errorDetalle} />}
        {catalogo.errorBaja && <ErrorMensaje mensaje={catalogo.errorBaja} />}
        {listado.isPending ? <Cargando mensaje="Cargando productos…" /> :
          listado.isError ? <ErrorMensaje mensaje={listado.error.message} /> :
          listado.data.length === 0 ? <Vacio mensaje="No hay productos activos." /> : (
            <TablaCatalogo registros={listado.data} columnas={columnas} titulo="Productos"
              ocupado={ocupado} puedeEditar onEditar={catalogo.abrir} onEliminar={(id) => setBaja(listado.data?.find((producto) => producto.id === id) ?? null)}
              accionesVerticales accionesExtra={(producto) => (
                <button className="btn-secundario" type="button" disabled={ocupado}
                  onClick={() => abrirStock(producto)}>Stock</button>
              )} />
          )}
      </div>

      {baja && (
        <ConfirmarAccion titulo="Dar de baja producto" confirmar="Dar de baja" peligro
          ocupado={ocupado} error={catalogo.errorBaja} onCerrar={() => setBaja(null)}
          onConfirmar={async () => {
            try { await catalogo.eliminar(baja.id); setBaja(null); }
            catch { /* El modal muestra el error de la mutación. */ }
          }}>
          <p>¿Querés dar de baja «<strong className="break-words">{baja.nombre}</strong>»?</p>
          <p>El producto dejará de aparecer en el catálogo público. Sus datos históricos permanecerán disponibles en los pedidos.</p>
        </ConfirmarAccion>
      )}
      {catalogo.abierto && (
        <ProductoModal registro={catalogo.seleccionado} ocupado={catalogo.ocupado}
          categorias={categorias.data ?? []} cargandoCategorias={categorias.isPending}
          errorCategorias={categorias.error?.message}
          error={catalogo.errorFormulario} onGuardar={catalogo.guardar} onCerrar={catalogo.cerrar} />
      )}
      {productoStock && (
        <StockModal registro={productoStock} ocupado={guardandoStock} error={errorStock}
          onGuardar={guardarStock} onCerrar={cerrarStock} />
      )}
    </main>
  );
}
