import { notificarError } from "@/shared/api/notificarError";
import { authApi } from "@/features/auth/services/auth";
import { useAuthStore } from "@/features/auth/store/authStore";
import type { RegistroDatos } from "@/features/auth/types/auth.types";

async function conAviso<T>(operacion: () => Promise<T>): Promise<T> {
  try {
    return await operacion();
  } catch (error) {
    notificarError(error);
    throw error;
  }
}

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const checking = useAuthStore((state) => state.checking);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  return {
    user,
    checking,
    login: (email: string, password: string) => conAviso(() => login(email, password)),
    logout: () => conAviso(logout),
    registrar: (datos: RegistroDatos) => conAviso(() => authApi.registrar(datos)),
  };
}

export function useEsAdmin(): boolean {
  return useAuthStore((state) => state.user?.roles.includes("admin") ?? false);
}
