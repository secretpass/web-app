import { Button, IconPlus } from "@heroui/react";
import { IconCode } from "@tabler/icons-react";
import { useParams } from "react-router";
import { ErrorDisplay } from "@/components";
import { Shimmer } from "@/components/shimmer";
import { ProjectLayout } from "../ProjectLayout";
import { useEnvironmentQuery } from "./queries";

export function EnvironmentDashboard() {
  const { env_name, project_id } = useParams<{
    env_name: string;
    project_id: string;
  }>();

  const query = useEnvironmentQuery(project_id ?? "", env_name ?? "");

  return (
    <ProjectLayout
      links={[
        {
          Icon: IconCode,
          to: `/p/${project_id}/env/${env_name}`,
          label: <pre className="font-mono">{env_name}</pre>,
        },
      ]}
      actions={
        <Button variant="ghost">
          <IconPlus /> Create Secret
        </Button>
      }
      description={
        <Shimmer
          active={query.isPending}
          hidden={query.isError}
          className="h-6"
        >
          {query.data?.environment.description}
        </Shimmer>
      }
    >
      {query.isError && (
        <ErrorDisplay
          value={{
            title: `Error fetching ${env_name}`,
            content: query.error.message,
          }}
        />
      )}
    </ProjectLayout>
  );
}
