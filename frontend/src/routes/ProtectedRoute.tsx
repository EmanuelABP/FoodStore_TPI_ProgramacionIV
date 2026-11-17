import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth";
import { Cargando } from "@/shared/components/EstadoListado";

interface Props {
  allowedRoles?: readonly string[];
}

export default function ProtectedRoute({ allowedRoles }: Props) {
  const user = useAuthStore((state) => state.user);
  const checking = useAuthStore((state) => state.checking);
  if (checking) return <Cargando mensaje="Comprobando sesión…" />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.some((rol) => user.roles.includes(rol))) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet />;
}
