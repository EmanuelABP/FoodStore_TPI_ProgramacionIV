import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth";
import { Cargando, ErrorMensaje, Vacio } from "@/shared/components/EstadoListado";
import { useCartStore } from "@/store/cartStore";
import { useNotificationStore } from "@/store/notificationStore";
import CheckoutForm from "../components/CheckoutForm";
import ResumenCarrito from "../components/ResumenCarrito";
import { useCarritoProductos } from "../hooks/useCarritoProductos";
import { useCrearPedido } from "../hooks/usePedidos";

export default function CheckoutPage() {
  const { items, vaciar } = useCartStore();
  const usuarioId = useAuthStore((state) => state.user?.id);
  const carrito = useCarritoProductos(items);
  const { crear, enviando } = useCrearPedido();
  const navigate = useNavigate();

  return (
    <main className="mx-auto max-w-4xl space-y-5 px-6 py-10">
      <h1 className="text-3xl font-bold">Confirmar compra</h1>
      <Link to="/carrito" className="inline-block text-blue-700 underline dark:text-blue-300">Volver al carrito</Link>
      {!items.length ? <Vacio mensaje="Agregá productos al carrito antes de confirmar una compra." /> : (
        <>
          {carrito.cargando && <Cargando mensaje="Verificando los productos…" />}
          {!carrito.cargando && !carrito.valido && (
            <ErrorMensaje mensaje="Revisá las cantidades y la disponibilidad antes de confirmar." />
          )}
          <ResumenCarrito lineas={carrito.lineas} total={carrito.totalEstimado} />
          <CheckoutForm permitido={carrito.valido} ocupado={enviando} error={crear.error?.message}
            onConfirmar={async ({ direccion_entrega, forma_pago, notas }) => {
              try {
                const pedido = await crear.mutateAsync({
                  datos: {
                    items: items.map(({ producto_id, cantidad }) => ({ producto_id, cantidad })),
                    direccion_entrega: direccion_entrega.trim(),
                    forma_pago,
                    notas: notas.trim() || null,
                  },
                  items,
                });
                if (useAuthStore.getState().user?.id !== usuarioId) return;
                vaciar();
                useNotificationStore.getState().showNotification(`Pedido #${pedido.id} registrado.`);
                navigate("/mis-pedidos", { replace: true });
              } catch {
                // El formulario muestra el error de la mutación y mantiene el carrito.
              }
            }} />
        </>
      )}
    </main>
  );
}
