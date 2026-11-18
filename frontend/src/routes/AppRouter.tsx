import { Route, Routes } from "react-router-dom";
import Navbar from "@/shared/components/Navbar";
import ProtectedRoute from "./ProtectedRoute";
import { AdminCategoriasPage } from "@/features/categories";
import { AdminProductosPage, CatalogoPage } from "@/features/products";
import { AdminUsersPage, LoginPage, RegisterPage } from "@/features/auth";
import { AdminPedidosPage, AdminResumenPage, CarritoPage, CheckoutPage, MisPedidosPage } from "@/features/pedidos";
import UnauthorizedPage from "@/shared/components/UnauthorizedPage";

export default function AppRouter() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<CatalogoPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/carrito" element={<CarritoPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/mis-pedidos" element={<MisPedidosPage />} />
        </Route>
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/categorias" element={<AdminCategoriasPage />} />
          <Route path="/admin/productos" element={<AdminProductosPage />} />
          <Route path="/admin/usuarios" element={<AdminUsersPage />} />
          <Route path="/admin/pedidos" element={<AdminPedidosPage />} />
          <Route path="/admin/resumen" element={<AdminResumenPage />} />
        </Route>
      </Routes>
    </>
  );
}
