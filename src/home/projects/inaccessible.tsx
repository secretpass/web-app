import type { ProjectListItem } from "@/api-types/ProjectListItem";
import { Alert } from "@/components";
import { SectionHeader } from "@/components/sections/header";
import { ProjectCard } from "./list";

export function InaccessibleProjectsList({
  projects,
}: {
  projects: ProjectListItem[];
}) {
  return (
    <div>
      <SectionHeader title="Inaccessible projects" />
      <div className="bg-surface px-4 py-6 rounded-xl">
        <Alert
          status="warning"
          className="rounded-2xl bg-background shadow-none mb-6"
        >
          These projects are attached to the local service but under a different
          user name, please log in with the relevant username to access them.
        </Alert>

        <div className="grid gap-x-6 gap-y-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {projects.map(({ path, project }) => (
            <ProjectCard
              inaccessible
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
