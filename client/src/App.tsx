import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppProvider } from "@/contexts/AppContext";
import Home from "@/pages/Home";
import Billing from "@/pages/Billing";
import Settings from "@/pages/Settings";
import GroupWallet from "@/pages/GroupWallet";
import QRCode from "@/pages/QRCode";
import ImageGeneration from "@/pages/ImageGeneration";
import NotFound from "@/pages/not-found";

type Page = 'home' | 'billing' | 'settings' | 'group-wallet' | 'qr-code' | 'image-generation';

function Router() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };

  const handleBack = () => {
    setCurrentPage('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'billing':
        return <Billing onBack={handleBack} />;
      case 'settings':
        return <Settings onBack={handleBack} />;
      case 'group-wallet':
        return <GroupWallet onBack={handleBack} />;
      case 'qr-code':
        return <QRCode onBack={handleBack} />;
      case 'image-generation':
        return <ImageGeneration onBack={handleBack} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <Switch>
      <Route path="/" component={() => renderPage()} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AppProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
