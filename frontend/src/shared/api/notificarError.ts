import axios from "axios";
import { useNotificationStore } from "@/store/notificationStore";
import { mensajeApi } from "./servicioCrud";

export function notificarError(error: unknown) {
  let causa = error;
  while (causa instanceof Error) {
    // El interceptor ya muestra una notificación para el 403.
    if (axios.isAxiosError(causa) && causa.response?.status === 403) return;
    if (!causa.cause) break;
    causa = causa.cause;
  }
  useNotificationStore.getState().showNotification(mensajeApi(error));
}
