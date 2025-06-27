import { Switch, Route } from "wouter";
import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ChatPage from "@/pages/chat";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ChatPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [theme, setTheme] = useState<"retro-light" | "retro-dark">("retro-light");

  const toggleTheme = () => {
    setTheme(prev => prev === "retro-light" ? "retro-dark" : "retro-light");
  };

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="retro-light"
      themes={["retro-light", "retro-dark"]}
      enableSystem={false}
    >
      <HeroUIProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <div className={`${theme} min-h-screen`}>
              {/* Global theme toggle - you can place this in a header/nav later */}
              <button
                onClick={toggleTheme}
                className="fixed top-4 right-4 z-50 retro-button px-4 py-2 text-xs"
              >
                {theme === "retro-light" ? "DARK MODE" : "LIGHT MODE"}
              </button>
              
              <Toaster />
              <Router />
            </div>
          </TooltipProvider>
        </QueryClientProvider>
      </HeroUIProvider>
    </ThemeProvider>
  );
}

export default App;
