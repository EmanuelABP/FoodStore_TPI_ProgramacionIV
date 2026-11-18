import axios from "axios";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { authApi } from "@/features/auth/services/auth";
import type { UserPublic } from "@/features/auth/types/auth.types";

interface AuthState {
  user: UserPublic | null;
  checking: boolean;
  errorSesion: string | null;
  revisionSesion: number;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  limpiarSesion: () => void;
}

let verificacion: Promise<void> | undefined;

function sesionInvalida(error: unknown): boolean {
  return axios.isAxiosError<{ detail?: unknown }>(error)
    && (error.response?.status === 401
      || (error.response?.status === 400 && error.response.data.detail === "Cuenta de usuario desactivada"));
}

const mensajeVerificacion = "No se pudo comprobar la sesión. Revisá la conexión y volvé a intentarlo.";

export const useAuthStore = create<AuthState>()(persist(
  (set, get) => ({
    user: null,
    checking: true,
    errorSesion: null,
    revisionSesion: 0,
    async login(username, password) {
      const revision = get().revisionSesion + 1;
      verificacion = undefined;
      set({ revisionSesion: revision, checking: true, errorSesion: null });
      try {
        await authApi.token({ username, password });
        const user = await authApi.me();
        if (get().revisionSesion === revision) set({ user, checking: false });
      } catch (error) {
        if (get().revisionSesion === revision) {
          if (sesionInvalida(error)) get().limpiarSesion();
          else set({ checking: false, errorSesion: mensajeVerificacion });
        }
        throw error;
      }
    },
    async logout() {
      const revision = get().revisionSesion + 1;
      verificacion = undefined;
      set({ revisionSesion: revision });
      try {
        await authApi.logout();
      } finally {
        if (get().revisionSesion === revision) get().limpiarSesion();
      }
    },
    checkSession() {
      if (verificacion) return verificacion;
      const revision = get().revisionSesion;
      set({ checking: true, errorSesion: null });
      const consulta: Promise<void> = authApi.me()
        .then((user) => {
          if (verificacion === consulta && get().revisionSesion === revision) {
            set({ user, checking: false });
          }
        })
        .catch((error: unknown) => {
          if (verificacion !== consulta || get().revisionSesion !== revision) return;
          if (sesionInvalida(error)) {
            get().limpiarSesion();
          } else {
            // El perfil guardado queda pendiente de validación y las pantallas esperan el reintento.
            set({ checking: false, errorSesion: mensajeVerificacion });
          }
        })
        .finally(() => {
          if (verificacion === consulta) verificacion = undefined;
        });
      verificacion = consulta;
      return consulta;
    },
    limpiarSesion() {
      verificacion = undefined;
      set((state) => ({
        user: null, checking: false, errorSesion: null, revisionSesion: state.revisionSesion + 1,
      }));
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
