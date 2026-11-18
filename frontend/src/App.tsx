import { useEffect } from "react";
import { useAuthStore } from "@/features/auth";
import AppRouter from "@/routes/AppRouter";
import { ErrorMensaje } from "@/shared/components/EstadoListado";
import FirmaVisual from "@/shared/components/FirmaVisual";
import Toast from "@/shared/components/Toast";

export default function App() {
  const errorSesion = useAuthStore((state) => state.errorSesion);
  useEffect(() => {
    void useAuthStore.getState().checkSession();
  }, []);

  return (
    <>
      {errorSesion ? (
        <main className="mx-auto max-w-lg space-y-4 px-6 py-10">
          <h1 className="text-2xl font-bold">Comprobar sesión</h1>
          <ErrorMensaje mensaje={errorSesion} />
          <button type="button" className="btn-primario"
            onClick={() => { void useAuthStore.getState().checkSession(); }}>Reintentar</button>
        </main>
      ) : <AppRouter />}
      <Toast />
      <FirmaVisual />
    </>
  );
}
