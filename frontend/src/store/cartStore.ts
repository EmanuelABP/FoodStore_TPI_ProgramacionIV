import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductoRead } from "@/features/products";

export interface CartItem {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
}

interface CartState {
  items: CartItem[];
  agregar: (producto: ProductoRead) => void;
  quitar: (productoId: number) => void;
  cambiarCantidad: (productoId: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>()(persist(
  (set, get) => ({
    items: [],
    agregar(producto) {
      if (!producto.activo || !producto.disponible || producto.stock < 1) return;

      set((state) => {
        const existente = state.items.find((item) => item.producto_id === producto.id);
        const cantidad = (existente?.cantidad ?? 0) + 1;
        if (cantidad > producto.stock) return state;

        const item: CartItem = {
          producto_id: producto.id,
          nombre: producto.nombre,
          precio_unitario: producto.precio_base,
          cantidad,
        };
        return {
          items: existente
            ? state.items.map((actual) => actual.producto_id === producto.id ? item : actual)
            : [...state.items, item],
        };
      });
    },
    quitar(productoId) {
      set((state) => ({ items: state.items.filter((item) => item.producto_id !== productoId) }));
    },
    cambiarCantidad(productoId, cantidad) {
      if (!Number.isSafeInteger(cantidad) || cantidad < 1) return;
      set((state) => ({
        items: state.items.map((item) => item.producto_id === productoId ? { ...item, cantidad } : item),
      }));
    },
    vaciar: () => set({ items: [] }),
    total: () => get().items.reduce((total, item) => total + item.precio_unitario * item.cantidad, 0),
  }),
  {
    name: "food-store-tpi-cart",
    partialize: ({ items }) => ({ items }),
  },
));
