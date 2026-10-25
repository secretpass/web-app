import { Button, IconPlus, Separator } from "@heroui/react";
import { IconRefresh } from "@tabler/icons-react";
import { Link } from "react-router";
import { useSession } from "@/auth";
import { Alert } from "@/components";
import { PageHeader } from "@/components/sections/header";
import { Shimmer } from "@/components/shimmer";
import { isCloud, isLocal, OPERATION_MODE } from "@/constants";
import { useProjectsListQuery } from "@/projects";
import { CreatePasskeyButton } from "@/user/CreatePasskey";
import { ProjectsList } from "./projects/list";
import { PendingProjectsList } from "./projects/pending";

export function HomeDashboard() {
  const projects_list = useProjectsListQuery();
  const session = useSession();

  return (
    <div className="content mx-auto container">
      <PageHeader title="Home">
        <Button
          isIconOnly
          isDisabled={projects_list.isFetching}
          variant="ghost"
          onClick={() => projects_list.refetch()}
        >
          <IconRefresh className="size-6" />
        </Button>
        {isCloud && (
          <Link to="/new">
            <Button variant="primary">
              <IconPlus />
              Create Project
            </Button>
          </Link>
        )}
      </PageHeader>

      {session.passkeys.length === 0 && (
        <Alert
          status="warning"
          title={`${OPERATION_MODE} passkey missing`}
          className="my-8 shadow-none"
          action={
            <CreatePasskeyButton variant="ghost">
              Create Passkey
            </CreatePasskeyButton>
          }
        >
          You don't have a passkey setup, you won't be able to access secrets
          without a passkey.
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

      {!projects_list.isPending && (
        <div className="flex gap-8 my-8 items-center">
          <Separator className="flex-1" />
          <div className="text-muted">Missing something?</div>
          <Separator className="flex-1" />
        </div>
      )}
    </div>
  );
}
