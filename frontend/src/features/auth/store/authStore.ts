import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { authApi } from "@/features/auth/services/auth";
import type { UserPublic } from "@/features/auth/types/auth.types";

interface AuthState {
  user: UserPublic | null;
  checking: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  limpiarSesion: () => void;
}

let verificacion: Promise<void> | undefined;

export const useAuthStore = create<AuthState>()(persist(
  (set, get) => ({
    user: null,
    checking: true,
    async login(username, password) {
      await authApi.token({ username, password });
      try {
        const user = await authApi.me();
        set({ user, checking: false });
      } catch (error) {
        get().limpiarSesion();
        throw error;
      }
    },
    async logout() {
      try {
        await authApi.logout();
      } finally {
        get().limpiarSesion();
      }
    },
    checkSession() {
      if (verificacion) return verificacion;
      set({ checking: true });
      const consulta: Promise<void> = authApi.me()
        .then((user) => {
          if (verificacion === consulta) set({ user, checking: false });
        })
        .catch(() => {
          if (verificacion === consulta) get().limpiarSesion();
        })
        .finally(() => {
          if (verificacion === consulta) verificacion = undefined;
        });
      verificacion = consulta;
      return consulta;
    },
    limpiarSesion() {
      verificacion = undefined;
      set({ user: null, checking: false });
    },
  }),
  {
    name: "food-store-tpi-auth",
    storage: createJSONStorage(() => sessionStorage),
    partialize: ({ user }) => ({ user }),
    // Al restaurar el perfil se conservan la comprobación inicial y las acciones actuales.
    merge: (persistido, actual) => ({
      ...actual,
      user: (persistido as Pick<AuthState, "user"> | undefined)?.user ?? null,
    }),
  },
));
