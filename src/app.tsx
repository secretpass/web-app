import { Toast } from "@heroui/react";
import { Navbar } from "@/features/navigation";
import { SessionProvider } from "./auth";

export function App() {
  return (
    <main className="min-h-screen min-w-screen bg-background">
      <Toast.Provider />
      <Navbar />

      <SessionProvider>Authorized content goes here</SessionProvider>
    </main>
  );
}
