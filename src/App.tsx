import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import AuthGuard from "./components/AuthGuard";
import Index from "./pages/Index";
import Tactics from "./pages/Tactics";
import TacticsLibrary from "./pages/TacticsLibrary";
import NotFound from "./pages/NotFound";
import SavedScriptsPage from "./pages/SavedScripts";
import AuthPage from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<AuthGuard><Index /></AuthGuard>} />
            <Route path="/tactics" element={<AuthGuard><TacticsLibrary /></AuthGuard>} />
            <Route path="/enhanced-tactics" element={<AuthGuard><Tactics /></AuthGuard>} />
            <Route path="/saved-scripts" element={<AuthGuard><SavedScriptsPage /></AuthGuard>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
