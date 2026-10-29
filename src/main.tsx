import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { FormDevtoolsPanel } from "@tanstack/react-form-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
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
        <TanStackDevtools
          plugins={[
            { name: "Tanstack Query", render: <ReactQueryDevtoolsPanel /> },
            { name: "Tanstack Form", render: <FormDevtoolsPanel /> },
          ]}
        />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
