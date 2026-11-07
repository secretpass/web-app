import { Button, Separator } from "@heroui/react";
import { IconRefresh } from "@tabler/icons-react";
import { Alert } from "@/components";
import { PageHeader } from "@/components/sections/header";
import { Shimmer } from "@/components/shimmer";
import { isLocal } from "@/constants";
import { useProjectsListQuery } from "@/projects";
import { HelpTopicList } from "./help";
import { PasskeysList } from "./PasskeysList";
import { InaccessibleProjectsList } from "./projects/inaccessible";
import { ProjectsList } from "./projects/list";
import { PendingProjectsList } from "./projects/pending";
import { RunnerDialog } from "./run";

export function HomeDashboard() {
  const projects_list = useProjectsListQuery();

  return (
    <div className="content mx-auto container">
      <PageHeader title="Home" className="sticky-below-nav">
        <Button
          isIconOnly
          isDisabled={projects_list.isFetching}
          variant="ghost"
          onClick={() => projects_list.refetch()}
        >
          <IconRefresh className="size-6" />
        </Button>
      </PageHeader>

      {projects_list.isError && (
        <Alert
          status="warning"
          title={`Error loading projects list`}
          className="my-8 shadow-none"
          action={<Button variant="ghost">Retry</Button>}
        >
          {projects_list.error.message}
        </Alert>
      )}

      <Shimmer className="h-32" active={projects_list.isPending}>
        {projects_list.isSuccess && (
          <ProjectsList projects={projects_list.data.projects} />
        )}
      </Shimmer>

      {isLocal && (
        <Shimmer className="h-32" active={projects_list.isPending}>
          {projects_list.isSuccess && (
            <PendingProjectsList paths={projects_list.data.pending} />
          )}
        </Shimmer>
      )}

      <Shimmer className="h-32" active={projects_list.isPending}>
        <PasskeysList />
      </Shimmer>

      {isLocal && (
        <Shimmer
          className="h-32"
          active={projects_list.isPending}
          hidden={!projects_list.data?.inaccessible.length}
        >
          {projects_list.isSuccess && (
            <InaccessibleProjectsList
              projects={projects_list.data.inaccessible}
            />
          )}
        </Shimmer>
      )}

      {!projects_list.isPending && isLocal && (
        <div className="my-8">
          <div className="flex gap-8 mb-6 items-center">
            <Separator className="flex-1" />
            <div className="text-muted">Missing something?</div>
            <Separator className="flex-1" />
          </div>

          <HelpTopicList />
        </div>
      )}

      <RunnerDialog />
    </div>
  );
}
