import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth";
import type { Role } from "@/features/auth";
import { Cargando } from "@/shared/components/EstadoListado";

interface Props {
  allowedRoles?: readonly Role[];
}

export default function ProtectedRoute({ allowedRoles }: Props) {
  const { pathname } = useLocation();
  const user = useAuthStore((state) => state.user);
  const checking = useAuthStore((state) => state.checking);
  if (checking) return <Cargando mensaje="Comprobando sesión…" />;
  if (!user) return <Navigate to="/login" replace state={{ volverA: pathname }} />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet />;
}
