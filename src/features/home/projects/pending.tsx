import { IconArrowRight, IconFolder } from "@tabler/icons-react";
import { Activity, useMemo } from "react";
import { createSearchParams, Link } from "react-router";
import type { ProjectPath } from "@/api-types/ProjectPath";
import { Alert } from "@/components";
import { SectionHeader } from "@/components/sections/header";

export function PendingProjectsList({ paths }: { paths: ProjectPath[] }) {
  return (
    <Activity mode={paths.length > 0 ? "visible" : "hidden"}>
      <SectionHeader title="Pending Projects"></SectionHeader>
      <div className="bg-surface px-4 py-6 rounded-xl">
        <Alert className="bg-background mb-6 rounded-xl" status="warning">
          You have attached directories that are not setup as Secretpass
          Projects, select the directory below to complete the setup.
        </Alert>
        <div className="flex flex-col gap-6">
          {paths.map(({ path, short_path }) => (
            <PendingProjectPath
              key={path}
              path={path}
              short_path={short_path}
            />
          ))}
        </div>
      </div>
    </Activity>
  );
}

function PendingProjectPath({ path, short_path }: ProjectPath) {
  const params = useMemo(
    () => createSearchParams({ path, short_path }),
    [path, short_path],
  );
  return (
    <Link
      to={{
        pathname: "/new",
        search: `?${params}`,
      }}
      className="group flex items-center gap-2 bg-background px-6 py-2 rounded-xl hover:bg-background-secondary"
    >
      <IconFolder />
      <div className="font-mono grow py-2">{short_path}</div>

      <div className="hidden group-hover:flex gap-4 py-2 px-4 rounded-xl hover:bg-background-tertiary">
        Setup Project
        <IconArrowRight />
      </div>
    </Link>
  );
}
