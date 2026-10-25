import { Link } from "react-router";
import type { ProjectListItem } from "@/api-types/ProjectListItem";
import type { ProjectPath } from "@/api-types/ProjectPath";
import type { SecretpassProject } from "@/api-types/SecretpassProject";
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
  );
}

function ProjectCard({
  project,
  path,
}: {
  project: SecretpassProject;
  path: ProjectPath | null;
  inaccessible?: boolean;
}) {
  return (
    <Link to={`/project/${project.id}`} className="bg-white dark:bg-slate-900">
      <div>{project.name}</div>

      {path !== null && <div>{path.short_path}</div>}
    </Link>
  );
}
