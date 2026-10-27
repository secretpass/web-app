import { Button, Description, IconPlus } from "@heroui/react";
import { IconCode } from "@tabler/icons-react";
import { Link, useParams } from "react-router";
import type { SpassEnvironment } from "@/api-types/SpassEnvironment";
import { ProjectLayout } from "../ProjectLayout";
import { useProjectQuery } from "../queries";

export function ProjectHome() {
  const { project_id } = useParams<{ project_id: string }>();
  const { data } = useProjectQuery(project_id || "");

  return (
    <ProjectLayout
      links={[]}
      description={data?.project.description}
      actions={
        <Button variant="ghost">
          <IconPlus /> New Environment
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-4 bg-surface rounded-xl py-6 px-4">
        {data?.environments.map((environment) => (
          <EnvironmentItem
            key={environment.name}
            project_id={project_id ?? ""}
            environment={environment}
          />
        ))}
      </div>
    </ProjectLayout>
  );
}

function EnvironmentItem({
  environment,
  project_id,
}: {
  environment: SpassEnvironment;
  project_id: string;
}) {
  return (
    <Link
      to={`/p/${project_id}/env/${environment.name}`}
      className="bg-background hover:bg-background-secondary p-4 flex gap-4 items-start rounded-xl"
    >
      <IconCode className="h-6 w-auto text-muted" />
      <div className="flex flex-col grow gap-1">
        <pre className="font-mono text-lg">{environment.name}</pre>
        {environment.description && (
          <Description>{environment.description}</Description>
        )}
        <div className="text-xs text-muted text-right">
          {environment.created_at}
        </div>
      </div>
    </Link>
  );
}
