import { axiosInstance } from "@/shared/api/api";
import type { LoginDatos, UserCreate, UserPublic } from "@/features/auth/types/auth.types";

const AUTH = "/auth";
const USUARIOS = "/admin/usuarios";

export const authApi = {
  async token({ username, password }: LoginDatos): Promise<void> {
    await axiosInstance.post(AUTH + "/token", new URLSearchParams({ username, password }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
  },
  async me(): Promise<UserPublic> {
    return (await axiosInstance.get<UserPublic>(AUTH + "/me")).data;
  },
  async logout(): Promise<void> {
    await axiosInstance.post(AUTH + "/logout");
  },
  async registrar(datos: UserCreate): Promise<UserPublic> {
    return (await axiosInstance.post<UserPublic>(AUTH + "/register", datos)).data;
  },
  async usuarios(signal: AbortSignal): Promise<UserPublic[]> {
    return (await axiosInstance.get<UserPublic[]>(USUARIOS, { signal })).data;
  },
  async cambiarEstado(id: number, activo: boolean): Promise<UserPublic> {
    const accion = activo ? "activar" : "desactivar";
    return (await axiosInstance.post<UserPublic>(`${USUARIOS}/${id}/${accion}`)).data;
  },
};
