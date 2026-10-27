import { Button } from "@heroui/react";
import { IconFingerprint, IconFolder } from "@tabler/icons-react";
import { useSelector } from "@tanstack/react-form";
import { type SubmitEventHandler, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import { ErrorDisplay, useError } from "@/components";
import { PageHeader } from "@/components/sections/header";
import { useCreateProjectForm } from "./CreateProjectForm";
import { NewProjectEnvironmentDefinitions } from "./EnvironmentDefinitions";
import { NewProjectAlgorithm } from "./NewProjectAlgorithm";
import { ProjectOverview } from "./NewProjectOverview";

export function CreateProject() {
  const [search, _] = useSearchParams();
  const error = useError();
  const path = useMemo(() => search.get("path"), [search]);
  const short_path = useMemo(() => search.get("short_path"), [search]);

  const form = useCreateProjectForm(path, error);

  const onSubmit: SubmitEventHandler = useCallback(
    (evt) => {
      evt.preventDefault();

      form.handleSubmit({ path });
    },
    [form.handleSubmit, path],
  );

  const is_valid = useSelector(form.store, (state) => state.isValid);

  return (
    <form className="content mx-auto container" onSubmit={onSubmit}>
      <PageHeader
        title="Create Project"
        className="sticky-below-nav bg-background"
      >
        {short_path !== null && (
          <div className="flex items-center gap-2 font-mono">
            <IconFolder /> {short_path}
          </div>
        )}
      </PageHeader>

      <ProjectOverview form={form} />

      <NewProjectAlgorithm form={form} />

      <NewProjectEnvironmentDefinitions form={form} />

      <ErrorDisplay className="mt-8" value={error.value} />
      <div className="flex justify-end my-8">
        <Button type="submit" size="lg" isDisabled={!is_valid}>
          <IconFingerprint className="size-6" /> Create Project
        </Button>
      </div>
    </form>
  );
}
