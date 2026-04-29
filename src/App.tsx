import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ProtectedRoute, RedirectIfAuthenticated } from "@/components/auth/ProtectedRoute";
import Landing from "./pages/Landing.tsx";
import GetStarted from "./pages/GetStarted.tsx";
import Workspace from "./pages/Workspace.tsx";
import SignIn from "./pages/SignIn.tsx";
import SignUp from "./pages/SignUp.tsx";
import NotFound from "./pages/NotFound.tsx";
import JoinPage from "./pages/JoinPage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />

            {/* Auth pages — redirect to /app if already signed in */}
            <Route path="/sign-in" element={<RedirectIfAuthenticated><SignIn /></RedirectIfAuthenticated>} />
            <Route path="/sign-up" element={<RedirectIfAuthenticated><SignUp /></RedirectIfAuthenticated>} />

            {/* Onboarding — open to anyone, but the final step requires auth */}
            <Route path="/get-started" element={<GetStarted />} />

            {/* Workspace — requires both authentication AND workspace membership */}
            <Route path="/app" element={
              <ProtectedRoute requireWorkspace>
                <Workspace />
              </ProtectedRoute>
            } />

            {/* Public invite acceptance */}
            <Route path="/join/:code" element={<JoinPage />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
