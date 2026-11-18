import type { CartItem } from "@/store/cartStore";
import type { ProductoRead } from "@/features/products";
import { importe } from "../formato";

interface Linea {
  item: CartItem;
  producto: ProductoRead | null;
  problema?: string;
}

interface Props {
  lineas: Linea[];
  total: number;
  onCantidad?: (id: number, cantidad: number, stock: number) => void;
  onQuitar?: (id: number) => void;
}

export default function ResumenCarrito({ lineas, total, onCantidad, onQuitar }: Props) {
  return (
    <section aria-label="Productos del carrito" className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <ul className="divide-y divide-slate-200 dark:divide-slate-700">
        {lineas.map(({ item, producto, problema }) => {
          const precio = producto?.precio_base ?? item.precio_unitario;
          const stock = producto?.stock ?? 0;
          return (
            <li key={item.producto_id} className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0">
              <div className="min-w-0 max-w-full importe">
                <h2 className="font-semibold">{producto?.nombre ?? item.nombre}</h2>
                <p className="text-sm">{importe(precio)} por unidad · {item.cantidad} {item.cantidad === 1 ? "unidad" : "unidades"}</p>
                {producto && <p className="text-sm text-slate-600 dark:text-slate-300">Stock disponible: {stock}</p>}
                {problema && <p className="text-sm text-red-700 dark:text-red-300">{problema}</p>}
              </div>
              <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2">
                {onCantidad && (
                  <>
                    <button type="button" className="btn-secundario" aria-label={`Disminuir cantidad de ${item.nombre}`}
                      disabled={item.cantidad <= 1} onClick={() => onCantidad(item.producto_id, item.cantidad - 1, stock)}>−</button>
                    <button type="button" className="btn-secundario" aria-label={`Aumentar cantidad de ${item.nombre}`}
                      disabled={!producto?.activo || !producto.disponible || item.cantidad >= stock}
                      onClick={() => onCantidad(item.producto_id, item.cantidad + 1, stock)}>+</button>
                  </>
                )}
                <span className="importe font-semibold">Subtotal {importe(precio * item.cantidad)}</span>
                {onQuitar && (
                  <button type="button" className="btn-secundario btn-peligro" aria-label={`Quitar ${item.nombre}`}
                    onClick={() => onQuitar(item.producto_id)}>Quitar</button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="importe border-t border-slate-200 pt-4 text-lg font-semibold dark:border-slate-700">Total estimado {importe(total)}</p>
    </section>
  );
}
