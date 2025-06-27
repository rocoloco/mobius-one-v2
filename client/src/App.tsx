import { BrowserRouter, Routes, Route } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import LandingPage from "@/pages/landing";
import LoginPage from "./pages/login";
import DashboardPage from "@/pages/dashboard";
import QueryPage from "@/pages/query";
import HistoryPage from "@/pages/history";
import SettingsPage from "@/pages/settings";
import HelpPage from "@/pages/help";
import NotFound from "@/pages/not-found";

function AuthenticatedApp() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="query" element={<QueryPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

function PublicApp() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

function AppRouter() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/user'],
    retry: false,
    enabled: true
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4 mx-auto animate-pulse">
            <span className="text-white font-mono font-bold text-xl">M1</span>
          </div>
          <p className="font-mono text-gray-600">Loading Mobius One...</p>
        </div>
      </div>
    );
  }

  return user ? <AuthenticatedApp /> : <PublicApp />;
}

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="retro-light"
      themes={["retro-light"]}
      enableSystem={false}
    >
      <HeroUIProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <BrowserRouter>
              <div className="retro-light min-h-screen">
                <Toaster />
                <AppRouter />
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </HeroUIProvider>
    </ThemeProvider>
  );
}

export default App;
