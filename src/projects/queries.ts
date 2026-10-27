import { useQuery } from "@tanstack/react-query";
import type { GetProjectResult } from "@/api-types/GetProjectResult";
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

export function useProjectQuery(project_id: string) {
  return useQuery({
    queryKey: ["project", project_id],
    queryFn: (context) =>
      resolveApiRequest<GetProjectResult>(`/api/projects/${project_id}`, {
        signal: context.signal,
      }),
  });
}
