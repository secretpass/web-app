import { useQuery } from "@tanstack/react-query";
import type { GetEnvironmentResult } from "@/api-types/GetEnvironmentResult";
import { resolveApiRequest } from "@/utils";

export function useEnvironmentQuery(project_id: string, env_name: string) {
  return useQuery({
    queryKey: ["environment", project_id, env_name],
    queryFn: () =>
      resolveApiRequest<GetEnvironmentResult>(
        `/api/projects/${project_id}/env/${env_name}`,
      ),
  });
}
