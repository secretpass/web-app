import { useQuery } from "@tanstack/react-query";
import type { ListProjectsResult } from "@/api-types/ListProjectsResult";
import { resolveApiRequest } from "@/utils";

export const PROJECT_LIST_QUERY_KEY = ["projects_list"];

export function useProjectsListQuery() {
  return useQuery({
    queryKey: PROJECT_LIST_QUERY_KEY,
    queryFn: (context) =>
      resolveApiRequest<ListProjectsResult>("/api/projects", {
        signal: context.signal,
      }),
  });
}
