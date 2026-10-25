import { Toast } from "@heroui/react";
import { Route, Routes } from "react-router";
import { Navbar } from "@/navigation";
import { SessionProvider } from "./auth";
import { HomeDashboard } from "./features/home/WelcomeDashboard";

export function App() {
  return (
    <main className="min-h-screen min-w-screen bg-background">
      <Toast.Provider />
      <Navbar />

      <SessionProvider>
        <Routes>
          <Route path="/" element={<HomeDashboard />} />
        </Routes>
      </SessionProvider>
    </main>
  );
}
