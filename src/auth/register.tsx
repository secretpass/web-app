import {
  Button,
  Description,
  Input,
  Label,
  TextField,
  toast,
} from "@heroui/react";
import { IconFingerprint } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { type SubmitEventHandler, useCallback, useState } from "react";
import * as z from "zod";
import type { AuthorizationResponse } from "@/api-types/AuthorizationResponse";
import type { CreateUserRequest } from "@/api-types/CreateUserRequest";
import type { RegistrationResponse } from "@/api-types/RegistrationResponse";
import { ErrorDisplay, useError } from "@/components";
import { ConfirmationCodeInput, generateChallenge } from "@/components/otp";
import {
  authorize_operation,
  create_passkey,
  type PasskeyCreationResponse,
} from "@/core";
import { resolveApiRequest } from "@/utils";
import { SESSION_QUERY_KEY } from "./query";

const profile_schema = z.object({
  email: z.email(),
  name: z.string().min(2),
});

const confirmation_schema = z.object({
  confirmation_code: z.string().length(6),
  passkey_name: z.string().min(2),
});

type ProfileForm = z.infer<typeof profile_schema>;
type ConfirmationForm = z.infer<typeof confirmation_schema>;

interface ProfileDetails extends ProfileForm {
  id: string;
  challenge: string;
  passkey_response: PasskeyCreationResponse;
}

export function RegistrationView() {
  const error = useError();
  const queryClient = useQueryClient();
  const [details, setDetails] = useState<ProfileDetails | null>(null);

  const profile_form = useForm({
    defaultValues: {
      email: "",
      name: "",
    } satisfies ProfileForm,
    onSubmit: async (data) => {
      const passkey_challenge = await error.catch(
        "Error creating passkey challenge",
        () => generateChallenge("PasskeySignup", data.value.email),
        { capture: "signup_generate_passkey_challenge" },
      );
      if (!passkey_challenge.ok) {
        return;
      }

      const user_id = crypto.randomUUID();

      const create_result = await error.catch(
        "Error creating passkey",
        () =>
          create_passkey({
            challenge: passkey_challenge.result.challenge,
            email: data.value.email,
            full_name: data.value.name,
            exclude_keys: [],
            user_id,
          }),
        { capture: "signup_create_passkey" },
      );
      if (!create_result.ok) {
        return;
      }

      // Intentionally allow temporary failure allowing the user to resend the challenge
      await error.catch(
        "Temporary error sending email code",
        () => generateChallenge("EmailSignup", data.value.email),
        {
          toast: true,
          capture: "signup_send_email_challenge",
        },
      );

      setDetails({
        id: user_id,
        email: data.value.email,
        name: data.value.email,
        challenge: passkey_challenge.result.challenge,
        passkey_response: create_result.result,
      });
    },
    validators: { onChange: profile_schema },
  });

  const confirmation_form = useForm({
    defaultValues: {
      confirmation_code: "",
      passkey_name: "",
    } satisfies ConfirmationForm,
    validators: { onChange: confirmation_schema },
    onSubmitMeta: {} as ProfileDetails,
    onSubmit: async (data) => {
      const auth_result = await error.catch(
        "Error authorizing with passkey",
        () =>
          authorize_operation({
            challenge: data.meta.challenge,
            allowed_credentials: [data.meta.passkey_response.id],
          }),
        { capture: "signup_authorize_create" },
      );

      if (!auth_result.ok) {
        return;
      }

      const registration_result = await error.catch(
        "Error creating account",
        () =>
          resolveApiRequest("/api/auth/register", {
            method: "POST",
            body: JSON.stringify({
              id: data.meta.id,
              email: data.meta.email,
              name: data.meta.name,
              passkey_name: data.value.passkey_name,
              confirmation_code: data.value.confirmation_code,
              auth_response: auth_result.result as AuthorizationResponse,
              passkey_response: data.meta
                .passkey_response as RegistrationResponse,
            } satisfies CreateUserRequest),
          }),
        {
          capture: "signup_complete",
        },
      );

      if (!registration_result.ok) {
        return;
      }

      queryClient.resetQueries({ queryKey: SESSION_QUERY_KEY });

      toast("Registration successful!", { variant: "success" });
    },
  });

  const onSubmit: SubmitEventHandler = useCallback(
    (event) => {
      event.preventDefault();

      if (details === null) {
        profile_form.handleSubmit();
      } else {
        confirmation_form.handleSubmit(details);
      }
    },
    [details, profile_form.handleSubmit, confirmation_form.handleSubmit],
  );

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <profile_form.Field name="name">
        {(field) => (
          <TextField
            isRequired
            variant="secondary"
            isReadOnly={details !== null}
            isInvalid={!field.state.meta.isValid && field.state.meta.isTouched}
          >
            <Label htmlFor="id">Fullname</Label>
            <Input
              autoComplete="name"
              spellCheck={false}
              type="text"
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <Description>
              Your full name, or a screen name{" "}
              <i>(we don't mind, your boss might)</i>
            </Description>
          </TextField>
        )}
      </profile_form.Field>
      <profile_form.Field name="email">
        {(field) => (
          <TextField
            isRequired
            variant="secondary"
            isReadOnly={details !== null}
            isInvalid={!field.state.meta.isValid && field.state.meta.isTouched}
          >
            <Label htmlFor="id">Work email</Label>
            <Input
              autoComplete={"email"}
              spellCheck={false}
              type="email"
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <Description>
              This email will be associated as the username in projects. You can
              have multiple passkeys under the same email in different devices.
            </Description>
          </TextField>
        )}
      </profile_form.Field>

      {details !== null && (
        <>
          <confirmation_form.Field name="passkey_name">
            {(field) => (
              <TextField
                isInvalid={
                  !field.state.meta.isValid && field.state.meta.isTouched
                }
                variant="secondary"
              >
                <Label>Passkey Name</Label>
                <Input
                  type="text"
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <Description>
                  Since your account can have multiple passkeys, git this one a
                  name to distinguish it
                </Description>
              </TextField>
            )}
          </confirmation_form.Field>
          <confirmation_form.Field name="confirmation_code">
            {(field) => (
              <ConfirmationCodeInput
                kind="EmailSignup"
                owner={details.email}
                onConfirmation={field.handleChange}
              />
            )}
          </confirmation_form.Field>
        </>
      )}

      <ErrorDisplay value={error.value} />

      <div className="flex justify-end">
        {details === null && (
          <Button
            aria-label="Create Passkey"
            isDisabled={error.is_pending}
            size="lg"
            type="submit"
          >
            <IconFingerprint />
            Create Passkey
          </Button>
        )}

        {details !== null && (
          <Button
            aria-label="Complete Registration"
            isDisabled={error.is_pending}
            size="lg"
            type="submit"
          >
            <IconFingerprint />
            Complete Registration
          </Button>
        )}
      </div>
    </form>
  );
}
