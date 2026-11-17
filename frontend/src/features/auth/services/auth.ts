import { axiosInstance } from "@/shared/api/api";
import type { LoginDatos, RegistroDatos, UsuarioAuth } from "@/features/auth/types/auth.types";

const AUTH = "/api/v1/auth";

export const authApi = {
  async token({ email, password }: LoginDatos): Promise<void> {
    await axiosInstance.post(AUTH + "/token", new URLSearchParams({ username: email, password }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
  },
  async me(): Promise<UsuarioAuth> {
    return (await axiosInstance.get<UsuarioAuth>(AUTH + "/me")).data;
  },
  async logout(): Promise<void> {
    await axiosInstance.post(AUTH + "/logout");
  },
  async registrar(datos: RegistroDatos): Promise<UsuarioAuth> {
    return (await axiosInstance.post<UsuarioAuth>(AUTH + "/register", datos)).data;
  },
  async usuarios(signal: AbortSignal): Promise<UsuarioAuth[]> {
    return (await axiosInstance.get<UsuarioAuth[]>(AUTH + "/admin/usuarios", { signal })).data;
  },
  async cambiarEstado(id: number, activo: boolean): Promise<UsuarioAuth> {
    const accion = activo ? "activar" : "desactivar";
    return (await axiosInstance.post<UsuarioAuth>(AUTH + "/admin/usuarios/" + id + "/" + accion)).data;
  },
};
