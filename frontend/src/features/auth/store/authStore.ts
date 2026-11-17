import { create } from "zustand";
import { authApi } from "@/features/auth/services/auth";
import type { UsuarioAuth } from "@/features/auth/types/auth.types";

interface AuthState {
  user: UsuarioAuth | null;
  checking: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  limpiarSesion: () => void;
}

let verificacion: Promise<void> | undefined;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  checking: true,
  async login(email, password) {
    await authApi.token({ email, password });
    const user = await authApi.me();
    set({ user, checking: false });
  },
  async logout() {
    try {
      await authApi.logout();
    } finally {
      set({ user: null, checking: false });
    }
  },
  checkAuth() {
    if (verificacion) return verificacion;
    set({ checking: true });
    verificacion = authApi.me()
      .then((user) => set({ user, checking: false }))
      .catch(() => set({ user: null, checking: false }))
      .finally(() => { verificacion = undefined; });
    return verificacion;
  },
  limpiarSesion: () => set({ user: null, checking: false }),
}));
