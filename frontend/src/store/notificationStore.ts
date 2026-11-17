import { create } from "zustand";

interface NotificationState {
  mensaje: string;
  visible: boolean;
  id: number;
  showNotification: (mensaje: string) => void;
  hideNotification: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  mensaje: "",
  visible: false,
  id: 0,
  showNotification: (mensaje) => set((state) => ({ mensaje, visible: true, id: state.id + 1 })),
  hideNotification: () => set({ visible: false }),
}));
