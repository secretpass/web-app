import {
  Button,
  IconPlus,
  Input,
  Label,
  Modal,
  TextArea,
  TextField,
  toast,
} from "@heroui/react";
import { IconFingerprint } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { type SubmitEventHandler, useCallback, useState } from "react";
import * as z from "zod";
import type { CreateSecretRequest } from "@/api-types/CreateSecretRequest";
import type { PasskeyAuthorizationResult } from "@/api-types/PasskeyAuthorizationResult";
import { useAuthorizationParams } from "@/auth/useAuthorization";
import { ErrorDisplay, useError } from "@/components";
import { SAFE_NAME_SCHEMA } from "@/constants";
import type { ContributorPublicKey, MachinePublicKey } from "@/core";
import { encrypt_secret } from "@/core";
import { resolveApiRequest } from "@/utils";
import { useEnvironmentQuery } from "./queries";

interface CreateSecretProps {
  project_id: string;
  env_name: string;
  machines_keys: MachinePublicKey[];
  contributors_keys: ContributorPublicKey[];
}

const new_secret_schema = z.object({
  name: SAFE_NAME_SCHEMA,
  comments: z.string(),
  value: z.string(),
});

export function CreateSecretDialog({
  env_name,
  project_id,
  machines_keys,
  contributors_keys,
}: CreateSecretProps) {
  const [open, setOpen] = useState(false);
  const error = useError();
  const authParams = useAuthorizationParams(error);
  const query = useEnvironmentQuery(project_id, env_name);

  const form = useForm({
    defaultValues: {
      name: "",
      comments: "",
      value: "",
    } satisfies z.infer<typeof new_secret_schema>,
    validators: { onChange: new_secret_schema, onMount: new_secret_schema },
    onSubmit: async ({ value, formApi }) => {
      const params_op = await authParams("secret creation");
      if (!params_op.ok) {
        return;
      }

      const encrypt_op = await error.catch("Error encrypting secret", () =>
        encrypt_secret({
          auth_request: params_op.result,
          contributors_keys,
          machines_keys,
          secret_value: value.value,
        }),
      );
      if (!encrypt_op.ok) {
        return;
      }

      const create_op = await error.catch("Error creating secret", () =>
        resolveApiRequest(
          `/api/projects/${project_id}/env/${env_name}/secret`,
          {
            method: "POST",
            body: JSON.stringify({
              auth_result: encrypt_op.result
                .auth_response as PasskeyAuthorizationResult,
              comments: value.comments,
              name: value.name,
              machines_values: encrypt_op.result.machines_values,
              contributors_values: encrypt_op.result.contributors_values,
            } satisfies CreateSecretRequest),
          },
        ),
      );

      if (!create_op.ok) {
        return;
      }

      query.refetch().finally(() => {
        formApi.reset();
        setOpen(false);
        toast(`Secret '${value.name}' created successfully!`, {
          variant: "success",
        });
      });
    },
  });

  const onSubmit: SubmitEventHandler = useCallback(
    (evt) => {
      evt.preventDefault();

      form.handleSubmit();
    },
    [form.handleSubmit],
  );

  return (
    <Modal isOpen={open} onOpenChange={setOpen}>
      <Button variant="ghost">
        <IconPlus /> Create Secret
      </Button>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>
                Create a new secret under{" "}
                <span className="font-mono text-yellow-700">{env_name}</span>
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <form onSubmit={onSubmit} className="flex flex-col gap-6">
                <form.Field name="name">
                  {(field) => (
                    <TextField
                      isRequired
                      variant="secondary"
                      isInvalid={
                        field.state.meta.isDirty && !field.state.meta.isValid
                      }
                    >
                      <Label>Name</Label>
                      <Input
                        name={field.name}
                        value={field.state.value}
                        onChange={(evt) =>
                          field.handleChange(evt.currentTarget.value)
                        }
                        placeholder="NAME ME..."
                      />
                    </TextField>
                  )}
                </form.Field>
                <form.Field name="comments">
                  {(field) => (
                    <TextField
                      variant="secondary"
                      isInvalid={
                        field.state.meta.isDirty && !field.state.meta.isValid
                      }
                    >
                      <Label>Comment</Label>
                      <TextArea
                        name={field.name}
                        value={field.state.value}
                        className="field-sizing-content resize-none"
                        onChange={(evt) =>
                          field.handleChange(evt.currentTarget.value)
                        }
                        placeholder="Additional information about this secret..."
                      />
                    </TextField>
                  )}
                </form.Field>
                <form.Field name="value">
                  {(field) => (
                    <TextField
                      isRequired
                      variant="secondary"
                      isInvalid={
                        field.state.meta.isDirty && !field.state.meta.isValid
                      }
                    >
                      <Label>Secret Value</Label>
                      <TextArea
                        name={field.name}
                        value={field.state.value}
                        className="field-sizing-content resize-none font-mono"
                        onChange={(evt) =>
                          field.handleChange(evt.currentTarget.value)
                        }
                        placeholder="The value to store securely..."
                      />
                    </TextField>
                  )}
                </form.Field>

                <ErrorDisplay value={error.value} />

                <div className="flex justify-end">
                  <Button type="submit">
                    <IconFingerprint /> Create Secret
                  </Button>
                </div>
              </form>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
