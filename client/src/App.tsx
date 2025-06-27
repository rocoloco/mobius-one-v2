import { BrowserRouter, Routes, Route } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/layout/Layout";
import LandingPage from "@/pages/landing";
import DashboardPage from "@/pages/dashboard";
import QueryPage from "@/pages/query";
import HistoryPage from "@/pages/history";
import SettingsPage from "@/pages/settings";
import HelpPage from "@/pages/help";
import NotFound from "@/pages/not-found";

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
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<LandingPage />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="query" element={<QueryPage />} />
                    <Route path="history" element={<HistoryPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="help" element={<HelpPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </HeroUIProvider>
    </ThemeProvider>
  );
}

export default App;
