import { Toast } from "@heroui/react";
// import { LoginDashboard } from "@/features/auth/dash.tsx";
import { Navbar } from "@/features/navigation";

export function App() {
  return (
    <main className="min-h-screen min-w-screen bg-background">
      <Toast.Provider />
      <Navbar />

      {/* <LoginDashboard /> */}
    </main>
  );
}
