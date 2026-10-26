import {
  Alert,
  Button,
  Description,
  Input,
  Label,
  Tooltip,
} from "@heroui/react";
import { IconTrashFilled } from "@tabler/icons-react";
import clsx from "clsx";
import * as uuid from "uuid";
import type { CreateProjectForm } from "./CreateProjectForm";

export function NewProjectEnvironmentDefinitions({
  form,
}: {
  form: CreateProjectForm;
}) {
  return (
    <form.Field name="environments">
      {(field) => (
        <div>
          <div className="flex flex-col gap-2">
            <Label>Secret Environment</Label>
            <Description>
              Organize your secrets into different environments, environment
              access can be restricted per user/machine.
            </Description>
          </div>
          {field.state.value.map((env, index) => (
            <EnvironmentEditor key={env.id} index={index} form={form} />
          ))}
          <Alert status="success" className="shadow-none">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>
                Environments can be added, edited or deleted accordingly after
                the project setup has been completed.
              </Alert.Title>
            </Alert.Content>
          </Alert>

          <div className="flex justify-end">
            <Button
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
              Add Environment
            </Button>
          </div>
        </div>
      )}
    </form.Field>
  );
}

function EnvironmentEditor({
  index,
  form,
}: {
  index: number;
  form: CreateProjectForm;
}) {
  return (
    <form.FormGroup name={`environments[${index}]`}>
      {(group) => (
        <div
          className={clsx(
            "p-2 rounded-lg flex flex-col gap-2 bg-gray-300 dark:bg-gray-700",
            !group.state.meta.isValid && "border border-danger",
          )}
        >
          <form.Field name={`environments[${index}].name`}>
            {(field) => (
              <div className="flex gap-2 items-center">
                <Input
                  aria-label="Environment name"
                  placeholder="Env name"
                  className="grow"
                  value={field.name}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                />
                <Tooltip>
                  <Button
                    aria-label="Delete Environment"
                    variant="ghost"
                    className="text-muted hover:text-danger"
                    isIconOnly
                    onClick={() => field.removeValue(index)}
                  >
                    <IconTrashFilled />
                  </Button>
                  <Tooltip.Content>Delete environment</Tooltip.Content>
                </Tooltip>
              </div>
            )}
          </form.Field>
          <form.Field name={`environments[${index}].description`}>
            {(field) => (
              <Input
                aria-label="Environment description"
                placeholder="Description"
                variant="secondary"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
              />
            )}
          </form.Field>
        </div>
      )}
    </form.FormGroup>
  );
}
