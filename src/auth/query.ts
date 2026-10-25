import { useMutation, useQuery } from "@tanstack/react-query";
import type { SessionPackage } from "@/api-types/SessionPackage";
import { resolveApiRequest } from "@/utils";

export const SESSION_QUERY_KEY = ["session"];

export function useSessionQuery() {
  return useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: (context) =>
      resolveApiRequest<SessionPackage>("/api/auth/session", {
        signal: context.signal,
      }),
  });
}

export function useLogoutMutation() {
  return useMutation({
    mutationKey: ["session-logout"],
    mutationFn: () =>
      resolveApiRequest("/api/auth/session", { method: "DELETE" }),
    onSettled: (_, __, ___, ____, context) => {
      context.client.resetQueries({ queryKey: SESSION_QUERY_KEY });
    },
  });
}
