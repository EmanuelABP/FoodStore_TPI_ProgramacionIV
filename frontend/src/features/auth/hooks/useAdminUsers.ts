import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/features/auth/services/auth";
import { useAuthStore } from "@/features/auth/store/authStore";
import { notificarError } from "@/shared/api/notificarError";
import { useNotificationStore } from "@/store/notificationStore";

export function useAdminUsers() {
  const queryClient = useQueryClient();
  const idActual = useAuthStore((estado) => estado.user?.id);
  const limpiarSesion = useAuthStore((estado) => estado.limpiarSesion);
  const usuarios = useQuery({
    queryKey: ["admin", "usuarios"],
    queryFn: ({ signal }) => authApi.usuarios(signal),
  });
  const cambiarEstado = useMutation({
    onError: notificarError,
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) => authApi.cambiarEstado(id, activo),
    onSuccess: async (usuario) => {
      useNotificationStore.getState().showNotification(usuario.deleted_at ? "Usuario desactivado." : "Usuario activado.");
      if (usuario.id === idActual && usuario.deleted_at) {
        try { await authApi.logout(); }
        finally { limpiarSesion(); }
      } else {
        await queryClient.invalidateQueries({ queryKey: ["admin", "usuarios"] });
      }
    },
  });

  return { usuarios, cambiarEstado };
}
