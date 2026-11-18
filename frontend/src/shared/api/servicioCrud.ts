import axios from "axios";
import type { AxiosRequestConfig } from "axios";
import { axiosInstance } from "./api";

export function mensajeApi(error: unknown): string {
  if (axios.isAxiosError<{ detail?: unknown }>(error)) {
    const detalle = error.response?.data?.detail;
    if (typeof detalle === "string") return detalle;
    if (Array.isArray(detalle)) {
      const mensajes = detalle.flatMap((item: unknown) =>
        typeof item === "object" && item !== null && "msg" in item && typeof item.msg === "string"
          ? [item.msg]
          : [],
      );
      if (mensajes.length) return mensajes.join(" · ");
    }
    return error.response
      ? "La API respondió con un error (" + error.response.status + ")."
      : "No se pudo conectar con el servidor.";
  }
  return error instanceof Error ? error.message : "No se pudo completar la operación.";
}

async function conMensaje<T>(operacion: () => Promise<T>): Promise<T> {
  try {
    return await operacion();
  } catch (error) {
    throw new Error(mensajeApi(error), { cause: error });
  }
}

export function servicioCrud<Registro, Datos extends object>(coleccion: string, config?: AxiosRequestConfig) {
  const detalle = (id: number) => coleccion.replace(/\/$/, "") + "/" + id;

  return {
    listar(signal: AbortSignal): Promise<Registro[]> {
      return conMensaje(async () => (await axiosInstance.get<Registro[]>(coleccion, { ...config, signal })).data);
    },
    crear(datos: Datos): Promise<Registro> {
      return conMensaje(async () => (await axiosInstance.post<Registro>(coleccion, datos, config)).data);
    },
    actualizar(id: number, datos: Datos): Promise<Registro> {
      return conMensaje(async () => (await axiosInstance.put<Registro>(detalle(id), datos, config)).data);
    },
    eliminar(id: number): Promise<void> {
      return conMensaje(async () => { await axiosInstance.delete(detalle(id), config); });
    },
  };
}
