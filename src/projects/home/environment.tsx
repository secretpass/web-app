import { Description } from "@heroui/react";
import { IconCode } from "@tabler/icons-react";
import { Link } from "react-router";
import TimeAgo from "react-timeago";
import type { Environment } from "@/api-types/Environment";

export function EnvironmentItem({
  environment,
  project_id,
}: {
  environment: Environment;
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
          <TimeAgo date={environment.created_at} />
        </div>
      </div>
    </Link>
  );
}
