import { Link } from "react-router-dom";
import { Cargando, Vacio } from "@/shared/components/EstadoListado";
import { useCartStore } from "@/store/cartStore";
import ResumenCarrito from "../components/ResumenCarrito";
import { useCarritoProductos } from "../hooks/useCarritoProductos";

export default function CarritoPage() {
  const { items, quitar, cambiarCantidad, vaciar } = useCartStore();
  const carrito = useCarritoProductos(items);

  return (
    <main className="mx-auto max-w-4xl space-y-5 px-6 py-10">
      <h1 className="text-3xl font-bold">Carrito</h1>
      {!items.length ? <Vacio mensaje="Tu carrito está vacío." /> : (
        <>
          {carrito.cargando && <Cargando mensaje="Consultando stock y precios…" />}
          <ResumenCarrito lineas={carrito.lineas} total={carrito.totalEstimado}
            onCantidad={cambiarCantidad} onQuitar={quitar} />
        </>
      )}
      <div className="flex flex-wrap gap-3">
        <Link to="/" className="btn-secundario">Continuar comprando</Link>
        {items.length > 0 && (
          <>
            <button type="button" className="btn-secundario" onClick={vaciar}>Vaciar carrito</button>
            {carrito.valido ? <Link to="/checkout" className="btn-primario">Ir al checkout</Link> :
              <button type="button" className="btn-primario" disabled>Ir al checkout</button>}
          </>
        )}
      </div>
    </main>
  );
}
