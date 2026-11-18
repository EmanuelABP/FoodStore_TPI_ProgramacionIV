import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { setupInterceptors } from "@/shared/api/setupInterceptors";
import { useAuthStore } from "@/features/auth";
import "./index.css";

const queryClient = new QueryClient();
setupInterceptors();
useAuthStore.subscribe((actual, anterior) => {
  if (actual.user?.id !== anterior.user?.id || actual.user?.role !== anterior.user?.role) {
    queryClient.clear();
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
