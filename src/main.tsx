import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";
import { ThemeProvider } from "@/shared/theme/index.ts";
import { App } from "./app.tsx";
import { AnalyticsProvider } from "./shared/analytics/provider.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // Refresh every minute
    },
  },
});

createRoot(document.getElementById("root") || document.body).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AnalyticsProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </AnalyticsProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
