import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/features/auth";
import { useNotificationStore } from "@/store/notificationStore";
import { axiosInstance } from "./api";

export function setupInterceptors() {
  const revisiones = new WeakMap<InternalAxiosRequestConfig, number>();
  axiosInstance.interceptors.request.use((config) => {
    revisiones.set(config, useAuthStore.getState().revisionSesion);
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
        const actual = useAuthStore.getState();
        // Una respuesta pendiente de otra sesión no puede cerrar la cuenta recién iniciada.
        const mismaSesion = error.config && revisiones.get(error.config) === actual.revisionSesion;
        if (mismaSesion && ((estado === 401 && requiereSesion) || cuentaDesactivada)) {
          actual.limpiarSesion();
        }
        if (estado === 403 && mismaSesion) {
          useNotificationStore.getState().showNotification("Acceso denegado");
        }
      }
      return Promise.reject(error);
    },
  );
}
