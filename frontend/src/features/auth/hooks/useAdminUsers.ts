import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/features/auth/services/auth";
import { useAuthStore } from "@/features/auth/store/authStore";
import { notificarError } from "@/shared/api/notificarError";
import { useNotificationStore } from "@/store/notificationStore";

const usuariosKey = ["admin", "usuarios"];

export function useAdminUsers() {
  const queryClient = useQueryClient();
  const idActual = useAuthStore((estado) => estado.user?.id);
  const usuarios = useQuery({
    queryKey: usuariosKey,
    queryFn: ({ signal }) => authApi.usuarios(signal),
  });
  const cambiarEstado = useMutation({
    onError: notificarError,
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) => authApi.cambiarEstado(id, activo),
    onSuccess: async (usuario) => {
      useNotificationStore.getState().showNotification(usuario.disabled ? "Usuario desactivado." : "Usuario activado.");
      await queryClient.invalidateQueries({ queryKey: usuariosKey });
    },
  });

  return { usuarios, cambiarEstado, idActual };
}
