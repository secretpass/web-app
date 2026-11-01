import { Button, IconPlus } from "@heroui/react";
import { IconBotId, IconUsers } from "@tabler/icons-react";
import { useParams } from "react-router";
import { SectionHeader } from "@/components/sections/header";
import { ProjectLayout } from "../ProjectLayout";
import { useProjectQuery } from "../queries";
import { EnvironmentItem } from "./environment";

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

      <SectionHeader
        title={
          <>
            <IconUsers className="size-6" /> Users
          </>
        }
      >
        <Button variant="ghost">
          <IconPlus /> Add User
        </Button>
      </SectionHeader>

      <SectionHeader
        title={
          <>
            <IconBotId className="size-6" /> Machines
          </>
        }
      >
        <Button variant="ghost">
          <IconPlus /> Generate Key
        </Button>
      </SectionHeader>
    </ProjectLayout>
  );
}
