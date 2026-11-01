import { IconCode } from "@tabler/icons-react";
import { useParams } from "react-router";
import { Alert, ErrorDisplay } from "@/components";
import { Shimmer } from "@/components/shimmer";
import type { ContributorPublicKey, MachinePublicKey } from "@/core";
import { ProjectLayout } from "../ProjectLayout";
import { CreateSecretDialog } from "./CreateSecret";
import { useEnvironmentQuery } from "./queries";
import { SecretItem } from "./SecretItem";

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
        query.isSuccess && (
          <CreateSecretDialog
            env_name={env_name ?? ""}
            project_id={project_id ?? ""}
            machines_keys={query.data.machines_keys as MachinePublicKey[]}
            contributors_keys={
              query.data.contributors_keys as ContributorPublicKey[]
            }
          />
        )
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

      {!query.data?.secrets.length && !query.isPending && (
        <Alert title={`You have no secrets under this environment`}>
          Click create secret to create your first secret.
        </Alert>
      )}

      {!!query.data?.secrets.length && (
        <div className="flex flex-col gap-y-6">
          {query.data.secrets.map((item) => (
            <SecretItem key={item.definition.name} {...item} />
          ))}
        </div>
      )}
    </ProjectLayout>
  );
}
