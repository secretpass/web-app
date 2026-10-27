import { Toast } from "@heroui/react";
import { Route, Routes } from "react-router";
import { Navbar } from "@/navigation";
import { SessionProvider } from "./auth";
import { HomeDashboard } from "./home/WelcomeDashboard";
import { CreateProject } from "./projects/create/CreateProject";
import { EnvironmentDashboard } from "./projects/environments/EnvironmentDashboard";
import { ProjectHome } from "./projects/home/ProjectHome";

export function App() {
  return (
    <main className="min-h-screen min-w-screen bg-background">
      <Toast.Provider />
      <Navbar />

      <SessionProvider>
        <Routes>
          <Route index element={<HomeDashboard />} />
          <Route path="new" element={<CreateProject />} />

          <Route path="p">
            <Route path=":project_id">
              <Route index element={<ProjectHome />} />
              <Route path="env">
                <Route path=":env_name" element={<EnvironmentDashboard />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </SessionProvider>
    </main>
  );
}
