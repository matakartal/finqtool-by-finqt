import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from './contexts/ThemeContext';
import { ProStatusProvider } from '@/context/ProStatusContext';
import Home from "./pages/Home";
import NotFoundPage from "./pages/NotFoundPage";
import Rules from "./pages/Rules";

// For Chrome extensions, use HashRouter instead of BrowserRouter
const queryClient = new QueryClient();

const App: React.FC = () => (
  <ThemeProvider>
    <ProStatusProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {/* Use HashRouter for Chrome extensions */}
          <ErrorBoundary>
            <HashRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/rules" element={<Rules />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </HashRouter>
          </ErrorBoundary>
        </TooltipProvider>
      </QueryClientProvider>
    </ProStatusProvider>
  </ThemeProvider>
);

export default App;
