import type { ProductoRead } from "@/features/products/types/producto";
import { useCartStore } from "@/store/cartStore";

export default function ProductoCard({ producto }: { producto: ProductoRead }) {
  const cantidad = useCartStore((state) => state.items.find((item) => item.producto_id === producto.id)?.cantidad ?? 0);
  const agregar = useCartStore((state) => state.agregar);
  const vendible = producto.activo && producto.disponible && producto.stock > 0;

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {producto.imagen_url && (
        <img src={producto.imagen_url} alt={producto.nombre} loading="lazy"
          className="aspect-video w-full object-cover" />
      )}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-300">{producto.categoria.nombre}</p>
          <h2 className="mt-1 text-xl font-semibold">{producto.nombre}</h2>
        </div>
        {producto.descripcion && <p className="text-sm text-slate-700 dark:text-slate-300">{producto.descripcion}</p>}
        <p className="mt-auto text-lg font-semibold">
          {producto.precio_base.toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
        </p>
        <p className="text-sm">
          {!producto.disponible ? "No disponible" : producto.stock === 0 ? "Sin stock" : `Stock: ${producto.stock}`}
        </p>
        <button type="button" className="btn-primario self-start"
          disabled={!vendible || cantidad >= producto.stock} onClick={() => agregar(producto)}>
          Agregar al carrito
        </button>
        <p aria-live="polite" className="text-sm text-slate-600 dark:text-slate-300">
          {cantidad > 0 ? `En el carrito: ${cantidad}` : ""}
        </p>
      </div>
    </article>
  );
}
