import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "@/shared/components/Navbar";
import ProtectedRoute from "./ProtectedRoute";
import { CategoriesPage } from "@/features/categories";
import { IngredientesPage } from "@/features/ingredients";
import { ProductsPage } from "@/features/products";
import { LoginPage } from "@/features/auth";
import { RegisterPage } from "@/features/auth";
import UnauthorizedPage from "@/shared/components/UnauthorizedPage";
import { AdminUsersPage } from "@/features/auth";

export default function AppRouter() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/categories" replace />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/ingredientes" element={<IngredientesPage />} />
          <Route path="/categorias" element={<Navigate to="/categories" replace />} />
          <Route path="/productos" element={<Navigate to="/products" replace />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/usuarios" element={<AdminUsersPage />} />
        </Route>
      </Routes>
    </>
  );
}
