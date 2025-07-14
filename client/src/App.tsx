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
import HomePage from "@/pages/home";
import CollectionsPage from "@/pages/collections";
import EmptyQueuePage from "@/pages/empty-queue";
import HistoryPage from "@/pages/history";
import SettingsPage from "@/pages/settings";
import HelpPage from "@/pages/help";
import NotFound from "@/pages/not-found";

function AuthenticatedApp() {
  return (
    <Routes>
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<CollectionsPage />} />
        <Route path="collections" element={<CollectionsPage />} />
        <Route path="dashboard" element={<CollectionsPage />} />
        <Route path="chat" element={<HomePage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="/empty-queue" element={<EmptyQueuePage />} />
    </Routes>
  );
}

function PublicApp() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

function AppRouter() {
  const isLoggedOut = localStorage.getItem('logout') === 'true';
  const hasAuthToken = localStorage.getItem('authToken');
  
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/user'],
    retry: false,
    enabled: !isLoggedOut && !!hasAuthToken
  });

  // If explicitly logged out or no auth token, show public app
  if (isLoggedOut || !hasAuthToken) {
    return <PublicApp />;
  }

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #FAFBFC 0%, rgba(193, 237, 204, 0.02) 100%)',
        fontFamily: 'Inter, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'white',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
            marginLeft: 'auto',
            marginRight: 'auto',
            boxShadow: '0 8px 32px rgba(6, 26, 64, 0.12)',
            border: '1px solid rgba(226, 232, 240, 0.5)',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            <img 
              src="/logos/mobius-logo-light.png" 
              alt="Mobius Logo" 
              style={{
                width: '48px',
                height: '48px',
                objectFit: 'contain'
              }}
            />
          </div>
          <h1 style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
            fontSize: '24px',
            color: '#061A40',
            margin: '0 0 8px 0',
            letterSpacing: '0.5px'
          }}>
            MOBIUS ONE
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            color: '#4A5568',
            fontSize: '16px',
            margin: 0
          }}>
            Initializing your AI Terminal...
          </p>
        </div>
        
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.05); opacity: 0.8; }
            }
          `
        }} />
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
