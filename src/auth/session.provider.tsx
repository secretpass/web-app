import { createContext, type ReactNode, useContext, useMemo } from "react";
import type { SessionPackage } from "@/api-types/SessionPackage";
import { CONNECTION_REFUSED_ERR } from "@/constants";
import { AuthDashboard } from "./auth-dashboard";
import { useSessionQuery } from "./query";

const SessionContext = createContext<SessionPackage>(JSON.parse("null"));

export function SessionProvider({ children }: { children: ReactNode }) {
  const session = useSessionQuery();
  const connection_refused = useMemo(
    () => String(session.error) === CONNECTION_REFUSED_ERR,
    [session.error],
  );

  return (
    <>
      {session.isSuccess && (
        <SessionContext.Provider value={session.data}>
          {children}
        </SessionContext.Provider>
      )}
      {!session.isSuccess && (
        <AuthDashboard
          disconnected={connection_refused}
          isPending={session.isPending}
        />
      )}
    </>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
