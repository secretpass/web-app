import { useQuery } from "@tanstack/react-query";
import type { SessionPackage } from "@/api-types/SessionPackage";
import { resolveApiRequest } from "@/utils";

export const SESSION_QUERY_KEY = ["session"];

export function useSessionQuery() {
  return useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: () => resolveApiRequest<SessionPackage>("/api/auth/session"),
  });
}
