import { Toast } from "@heroui/react";
import { Route, Routes } from "react-router";
import { Navbar } from "@/navigation";
import { SessionProvider } from "./auth";
import { HomeDashboard } from "./home/WelcomeDashboard";
import { CreateProject } from "./projects/create/CreateProject";

export function App() {
  return (
    <main className="min-h-screen min-w-screen bg-background">
      <Toast.Provider />
      <Navbar />

      <SessionProvider>
        <Routes>
          <Route path="/" element={<HomeDashboard />} />
          <Route path="/new" element={<CreateProject />} />
        </Routes>
      </SessionProvider>
    </main>
  );
}
