import { useIsMutating, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth";
import type { UserPublic } from "@/features/auth";
import { useNotificationStore } from "@/store/notificationStore";
import { pedidosApi } from "../api/pedidos";
import type { CambioEstado, FiltrosPedidos, PedidoCreate, PedidoRead } from "../types/pedido";
import { problemaStock, productoCarritoQuery } from "./useCarritoProductos";
import type { CartItem } from "@/store/cartStore";

function claveSesion(usuario: UserPublic | null) {
  return ["pedidos", usuario?.id, usuario?.role] as const;
}

// La API devuelve todos los pedidos para admin. Para su vista personal, filtro cada página por dueño.
async function listarPropiosAdmin(usuarioId: number, filtros: FiltrosPedidos, signal: AbortSignal) {
  const propios: PedidoRead[] = [];
  const limite = 100;
  for (let skip = 0; ; skip += limite) {
    const datos = await pedidosApi.listar({ skip, limit: limite, estado: filtros.estado }, signal);
    propios.push(...datos.items.filter((pedido) => pedido.usuario_id === usuarioId));
    if (datos.items.length < limite || skip + limite >= datos.total) break;
  }
  return propios;
}

export function usePedidos(filtros: FiltrosPedidos, propios: boolean) {
  const usuario = useAuthStore((state) => state.user);
  const soloPropiosAdmin = propios && usuario?.role === "admin";
  return useQuery({
    queryKey: soloPropiosAdmin
      ? [...claveSesion(usuario), "propios", filtros.estado]
      : [...claveSesion(usuario), "lista", filtros],
    queryFn: async ({ signal }) => {
      if (!soloPropiosAdmin) return pedidosApi.listar(filtros, signal);
      const items = await listarPropiosAdmin(usuario.id, filtros, signal);
      return { items, total: items.length };
    },
    select: soloPropiosAdmin
      ? (datos) => ({ total: datos.total, items: datos.items.slice(filtros.skip, filtros.skip + filtros.limit) })
      : undefined,
    enabled: Boolean(usuario),
  });
}

export function useDetallePedido(id: number, propio: boolean) {
  const usuario = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: [...claveSesion(usuario), "detalle", id, propio],
    queryFn: async ({ signal }) => {
      const pedido = await pedidosApi.detalle(id, signal);
      if (propio && pedido.usuario_id !== usuario?.id) throw new Error("El pedido no pertenece a esta cuenta.");
      return pedido;
    },
    enabled: Boolean(usuario),
    retry: false,
  });
}

export function useResumenPedidos() {
  const usuario = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: [...claveSesion(usuario), "resumen"],
    queryFn: ({ signal }) => pedidosApi.resumen(signal),
    enabled: usuario?.role === "admin",
  });
}

function actualizarConsultas(cliente: QueryClient, cambioStock: boolean) {
  const pedidos = cliente.invalidateQueries({ queryKey: ["pedidos"] });
  const productos = cambioStock ? cliente.invalidateQueries({ queryKey: ["productos"] }) : undefined;
  return Promise.all([pedidos, productos]);
}

export function useCrearPedido() {
  const cliente = useQueryClient();
  const usuario = useAuthStore((state) => state.user);
  const mutationKey = [...claveSesion(usuario), "crear"];
  const enviando = useIsMutating({ mutationKey, exact: true }) > 0;
  const crear = useMutation({
    mutationKey,
    mutationFn: async ({ datos, items }: { datos: PedidoCreate; items: CartItem[] }) => {
      if (!items.length) throw new Error("El carrito está vacío.");
      const productos = await Promise.all(items.map((item) => cliente.fetchQuery(productoCarritoQuery(item.producto_id))));
      for (const [indice, item] of items.entries()) {
        const problema = problemaStock(item, productos[indice]);
        if (problema) throw new Error(`${item.nombre}. ${problema}`);
      }
      if (!usuario || usuario.id !== useAuthStore.getState().user?.id) {
        throw new Error("La sesión cambió. Volvé a iniciar sesión para comprar.");
      }
      return pedidosApi.crear(datos);
    },
    onSuccess: () => { void actualizarConsultas(cliente, true); },
    onError: () => { void cliente.invalidateQueries({ queryKey: ["productos"] }); },
  });
  return { crear, enviando };
}

export function useCancelarPedido() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => pedidosApi.cancelar(id),
    onSuccess: () => useNotificationStore.getState().showNotification("Pedido cancelado."),
    onSettled: (pedido) => actualizarConsultas(cliente, Boolean(pedido)),
  });
}

export function useCambiarEstadoPedido() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: CambioEstado }) => pedidosApi.cambiarEstado(id, datos),
    onSuccess: () => useNotificationStore.getState().showNotification("Estado del pedido actualizado."),
    onSettled: (pedido) => actualizarConsultas(cliente, pedido?.estado === "CANCELADO"),
  });
}
