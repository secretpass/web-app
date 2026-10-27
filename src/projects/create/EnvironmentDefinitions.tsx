import { Button, IconPlus, Input, InputGroup, Tooltip } from "@heroui/react";
import { IconAlignLeft, IconCode, IconTrashFilled } from "@tabler/icons-react";
import clsx from "clsx";
import * as uuid from "uuid";
import { SectionHeader } from "@/components/sections/header";
import type { CreateProjectForm } from "./CreateProjectForm";

export function NewProjectEnvironmentDefinitions({
  form,
}: {
  form: CreateProjectForm;
}) {
  return (
    <form.Field name="environments">
      {(field) => (
        <>
          <SectionHeader
            title="Secret Environments"
            description="Organize your secrets into different environments, environment access can be restricted per user/machine."
            className={clsx(!field.state.meta.isValid && "border-b-danger")}
          >
            <Button
              size="sm"
              aria-label="Add Environment"
              isDisabled={!field.state.meta.isValid}
              variant="ghost"
              onClick={() =>
                field.pushValue({
                  id: uuid.v7(),
                  name: "",
                  description: "",
                })
              }
            >
              <IconPlus />
              Add Environment
            </Button>
          </SectionHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {field.state.value.map((env, index) => (
              <EnvironmentEditor
                key={env.id}
                index={index}
                form={form}
                onDelete={() => field.removeValue(index)}
              />
            ))}
          </div>
        </>
      )}
    </form.Field>
  );
}

function EnvironmentEditor({
  index,
  form,
  onDelete,
}: {
  index: number;
  form: CreateProjectForm;
  onDelete: () => void;
}) {
  return (
    <form.FormGroup name={`environments[${index}]`}>
      {(group) => (
        <div
          className={clsx(
            "p-4 rounded-xl flex flex-col gap-2 bg-gray-300 dark:bg-gray-700",
            !group.state.meta.isValid && "border border-danger",
          )}
        >
          <form.Field name={`environments[${index}].name`}>
            {(field) => (
              <InputGroup isInvalid={!field.state.meta.isValid}>
                <InputGroup.Prefix>
                  <IconCode />
                </InputGroup.Prefix>
                <InputGroup.Input
                  required
                  aria-label="Environment name"
                  placeholder="Env name"
                  className="font-mono font-semibold"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                />
                <InputGroup.Suffix>
                  <Tooltip>
                    <Button
                      aria-label="Delete Environment"
                      variant="ghost"
                      className="text-muted hover:text-danger"
                      isIconOnly
                      onClick={onDelete}
                    >
                      <IconTrashFilled />
                    </Button>
                    <Tooltip.Content>Delete environment</Tooltip.Content>
                  </Tooltip>
                </InputGroup.Suffix>
              </InputGroup>
            )}
          </form.Field>
          <form.Field name={`environments[${index}].description`}>
            {(field) => (
              <InputGroup>
                <InputGroup.Prefix>
                  <IconAlignLeft />
                </InputGroup.Prefix>
                <InputGroup.Input
                  className="text-muted"
                  aria-label="Environment description"
                  placeholder="Description"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                />
              </InputGroup>
            )}
          </form.Field>
        </div>
      )}
    </form.FormGroup>
  );
}
