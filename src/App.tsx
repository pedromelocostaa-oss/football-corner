import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import { Layout } from "@/components/Layout";
import Dashboard from "./pages/Dashboard";
import Mensalistas from "./pages/Mensalistas";
import Avulsos from "./pages/Avulsos";
import Caixa from "./pages/Caixa";
import Membros from "./pages/Membros";
import Publico from "./pages/Publico";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <Layout>
                  <Dashboard />
                </Layout>
              }
            />
            <Route
              path="/mensalistas"
              element={
                <Layout>
                  <Mensalistas />
                </Layout>
              }
            />
            <Route
              path="/avulsos"
              element={
                <Layout>
                  <Avulsos />
                </Layout>
              }
            />
            <Route
              path="/caixa"
              element={
                <Layout>
                  <Caixa />
                </Layout>
              }
            />
            <Route
              path="/membros"
              element={
                <Layout>
                  <Membros />
                </Layout>
              }
            />
            <Route path="/publico" element={<Publico />} />
            <Route path="/public" element={<Publico />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
