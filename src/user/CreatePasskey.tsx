import {
  Button,
  type ButtonProps,
  Description,
  Input,
  Label,
  Modal,
  TextField,
} from "@heroui/react";
import { IconCircleCheck, IconFingerprint } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { type SubmitEventHandler, useCallback, useState } from "react";
import * as z from "zod";
import type { CreatePasskeyRequest } from "@/api-types/CreatePasskeyRequest";
import type { CreatePasskeyResponse } from "@/api-types/CreatePasskeyResponse";
import type { GenerateChallengeResponse } from "@/api-types/GenerateChallengeResponse";
import type { PasskeyAuthorizationResponse } from "@/api-types/PasskeyAuthorizationResponse";
import type { PasskeyCreationResponse } from "@/api-types/PasskeyCreationResponse";
import { SESSION_QUERY_KEY, useSession } from "@/auth";
import { ErrorDisplay, useError } from "@/components";
import { ConfirmationCodeInput } from "@/components/otp";
import { authorize_operation, create_passkey } from "@/core";
import { resolveApiRequest } from "@/utils";

const createSchema = z.object({
  passkey_name: z.string().min(2),
  confirmation_code: z.string().length(6),
});

type CreateForm = z.infer<typeof createSchema>;

export function CreatePasskeyButton(props: ButtonProps) {
  const [create_response, setCreateResponse] = useState<{
    create_response: PasskeyCreationResponse;
    challenge: string;
  } | null>(null);
  const error = useError();
  const { user, passkeys } = useSession();
  const [success, setSuccess] = useState(false);
  const queryClient = useQueryClient();

  const createPasskey = useCallback(async () => {
    const challenge_result = await error.catch(
      "Error starting passkey creation",
      () =>
        resolveApiRequest<GenerateChallengeResponse>(
          "/api/users/passkeys/create/start",
          {
            method: "POST",
          },
        ),
    );
    if (!challenge_result.ok) {
      return;
    }

    const create_result = await error.catch("Error creating passkey", () =>
      create_passkey({
        challenge: challenge_result.result.challenge,
        email: user.email,
        user_id: user.id,
        exclude_keys: passkeys.map((passkey) => passkey.id),
        full_name: user.name,
      }),
    );

    if (!create_result.ok) {
      return;
    }

    setCreateResponse({
      create_response: create_result.result,
      challenge: challenge_result.result.challenge,
    });
  }, [error.catch, user, passkeys]);

  const form = useForm({
    defaultValues: {
      passkey_name: "",
      confirmation_code: "",
    } satisfies CreateForm,
    onSubmitMeta: {} as {
      create_response: PasskeyCreationResponse;
      challenge: string;
    },
    onSubmit: async (data) => {
      const authorize_response = await error.catch(
        "Error authorizing save passkey",
        () =>
          authorize_operation({
            allowed_credentials: [data.meta.create_response.id],
            challenge: data.meta.challenge,
          }),
      );

      if (!authorize_response.ok) {
        return;
      }

      const save_response = await error.catch("Error saving passkey", () =>
        resolveApiRequest<CreatePasskeyResponse>("/api/users/passkeys/create", {
          method: "POST",
          body: JSON.stringify({
            auth_response:
              authorize_response.result as PasskeyAuthorizationResponse,
            confirmation_code: data.value.confirmation_code,
            create_response: data.meta.create_response,
            name: data.value.passkey_name,
          } satisfies CreatePasskeyRequest),
        }),
      );

      if (!save_response.ok) {
        return;
      }

      queryClient
        .invalidateQueries({
          queryKey: SESSION_QUERY_KEY,
        })
        .then(() => {
          setSuccess(true);
          setCreateResponse(null);
          data.formApi.reset();
        });
    },
  });

  const onSubmit: SubmitEventHandler = useCallback(
    (event) => {
      event.preventDefault();

      if (create_response === null) {
        createPasskey();
        return;
      }

      form.handleSubmit(create_response);
    },
    [create_response, createPasskey, form.handleSubmit],
  );

  const reset = useCallback(() => {
    form.reset();
    setCreateResponse(null);
    setSuccess(false);
  }, [form.reset]);

  return (
    <Modal
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          reset();
        }
      }}
    >
      <Button {...props} onClick={createPasskey}></Button>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Icon>
                {!success && <IconFingerprint className="size-6" />}
                {success && <IconCircleCheck className="size-6 text-success" />}
              </Modal.Icon>
              {!success && <Modal.Heading>Create a new passkey</Modal.Heading>}
              {success && <Modal.Heading>Passkey created</Modal.Heading>}
            </Modal.Header>
            <Modal.Body>
              {!success && (
                <form onSubmit={onSubmit} className="flex flex-col gap-6">
                  {create_response !== null && (
                    <form.Field name="passkey_name">
                      {(field) => (
                        <TextField isRequired>
                          <Label>Passkey Name</Label>
                          <Input
                            type="text"
                            name={field.name}
                            value={field.state.value}
                            onChange={(evt) =>
                              field.handleChange(evt.currentTarget.value)
                            }
                          />
                          <Description>
                            Since your account can have multiple passkeys, git
                            this one a name to distinguish it
                          </Description>
                        </TextField>
                      )}
                    </form.Field>
                  )}

                  {create_response !== null && (
                    <form.Field name="confirmation_code">
                      {(field) => (
                        <ConfirmationCodeInput
                          kind="EmailAuthorize"
                          onConfirmation={field.handleChange}
                          owner={user.email}
                        />
                      )}
                    </form.Field>
                  )}
                  <ErrorDisplay value={error.value} />

                  <div className="flex justify-between">
                    <Button variant="danger-soft" type="button" onClick={reset}>
                      Reset
                    </Button>

                    <Button type="submit">
                      <IconFingerprint />
                      {create_response === null && "Create Passkey"}
                      {create_response !== null && "Save Passkey"}
                    </Button>
                  </div>
                </form>
              )}
              {success && (
                <Description>
                  Your passkey has been created successfully and ready for use,
                  you can close this dialog.
                </Description>
              )}
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
