import { Button } from "@heroui/react";
import { IconFingerprint, IconFolder } from "@tabler/icons-react";
import { type SubmitEventHandler, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import { PageHeader } from "@/components/sections/header";
import { useCreateProjectForm } from "./CreateProjectForm";
import { NewProjectEnvironmentDefinitions } from "./EnvironmentDefinitions";
import { NewProjectAlgorithm } from "./NewProjectAlgorithm";
import { ProjectOverview } from "./NewProjectOverview";

export function CreateProject() {
  const [search, _] = useSearchParams();
  const path = useMemo(() => search.get("path"), [search]);
  const short_path = useMemo(() => search.get("short_path"), [search]);

  const form = useCreateProjectForm();

  const onSubmit: SubmitEventHandler = useCallback(
    (evt) => {
      evt.preventDefault();

      form.handleSubmit({ path });
    },
    [form.handleSubmit, path],
  );

  return (
    <form className="content mx-auto container" onSubmit={onSubmit}>
      <PageHeader title="Create Project">
        {short_path !== null && (
          <div className="flex items-center gap-2 font-mono">
            <IconFolder /> {short_path}
          </div>
        )}
      </PageHeader>

      <ProjectOverview form={form} />

      <NewProjectAlgorithm form={form} />

      <NewProjectEnvironmentDefinitions form={form} />

      <div className="flex justify-end">
        <Button type="submit">
          <IconFingerprint /> Create Project
        </Button>
      </div>
    </form>
  );
}
