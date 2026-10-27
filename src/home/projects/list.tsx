import { IconFolder, IconShieldHalfFilled } from "@tabler/icons-react";
import { Link } from "react-router";
import type { ProjectListItem } from "@/api-types/ProjectListItem";
import type { ProjectPath } from "@/api-types/ProjectPath";
import type { SpassProject } from "@/api-types/SpassProject";
import { Alert, CommandDisplay } from "@/components";
import { SectionHeader } from "@/components/sections/header";
import { isCloud, isLocal } from "@/constants";

export function ProjectsList({
  projects,
  inaccessible,
}: {
  projects: ProjectListItem[];
  inaccessible?: boolean;
}) {
  return (
    <div>
      <SectionHeader title="Your projects" />
      <div className="bg-surface px-4 py-6 rounded-xl">
        {projects.length === 0 && (
          <Alert
            status="warning"
            className="rounded-2xl bg-background shadow-none"
          >
            You don't have access to any projects at the moment,
            {isLocal && (
              <>
                please attach a project by running the command below in a
                project directory
                <CommandDisplay className="mt-4 rounded w-full">
                  spass attach
                </CommandDisplay>
              </>
            )}
            {isCloud && (
              <>
                Please create a new project or request your admin to invite you
                to an existing project.
              </>
            )}
          </Alert>
        )}

        <div className="grid gap-x-6 gap-y-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {projects.map(({ path, project }) => (
            <ProjectCard
              inaccessible={inaccessible}
              key={project.id}
              project={project}
              path={path}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  path,
}: {
  project: SpassProject;
  path: ProjectPath | null;
  inaccessible?: boolean;
}) {
  return (
    <Link
      to={`/p/${project.id}`}
      className="bg-background hover:bg-background-secondary p-4 rounded-xl flex gap-4 items-start"
    >
      <IconShieldHalfFilled className="size-6" />
      <div className="flex flex-col gap-2 grow">
        <div className="font-semibold">{project.name}</div>
        {project.description && (
          <div className="text-xs text-muted">{project.description}</div>
        )}

        {path !== null && (
          <div className="flex justify-end text-xs font-mono items-center text-muted">
            <IconFolder className="size-4" />
            {path.short_path}
          </div>
        )}
      </div>
    </Link>
  );
}
