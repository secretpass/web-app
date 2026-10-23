import { createContext, type ReactNode } from "react";
import type { SessionPackage } from "@/api-types/SessionPackage";
import { AuthDashboard } from "./auth-dashboard";
import { useSessionQuery } from "./query";

const SessionContext = createContext<SessionPackage>(JSON.parse("null"));

export function SessionProvider({ children }: { children: ReactNode }) {
  const session = useSessionQuery();

  return (
    <>
      {session.isSuccess && (
        <SessionContext.Provider value={session.data}>
          {children}
        </SessionContext.Provider>
      )}
      {!session.isSuccess && <AuthDashboard isPending={session.isPending} />}
    </>
  );
}
