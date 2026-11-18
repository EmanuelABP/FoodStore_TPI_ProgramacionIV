import axios from "axios";
import { useAuthStore } from "@/features/auth";
import { useNotificationStore } from "@/store/notificationStore";
import { axiosInstance } from "./api";

export function setupInterceptors() {
  axiosInstance.interceptors.request.use((config) => {
    config.headers.set("Accept", "application/json");
    return config;
  });

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (axios.isAxiosError<{ detail?: unknown }>(error)) {
        const ruta = error.config?.url;
        const estado = error.response?.status;
        const cuentaDesactivada = estado === 400
          && error.response?.data?.detail === "Cuenta de usuario desactivada";
        const requiereSesion = ruta !== "/auth/token" && ruta !== "/auth/me";
        if ((estado === 401 && requiereSesion) || cuentaDesactivada) {
          useAuthStore.getState().limpiarSesion();
        }
        if (estado === 403) {
          useNotificationStore.getState().showNotification("Acceso denegado");
        }
      }
      return Promise.reject(error);
    },
  );
}
