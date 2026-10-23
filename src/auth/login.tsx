import {
  Button,
  Description,
  Input,
  Label,
  TextField,
  toast,
} from "@heroui/react";
import { IconArrowRight, IconFingerprint, IconMail } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { type SubmitEventHandler, useCallback, useState } from "react";
import * as z from "zod";
import type { AuthorizationResponse } from "@/api-types/AuthorizationResponse";
import type { EmailLoginRequest } from "@/api-types/EmailLoginRequest";
import type { PasskeyLoginRequest } from "@/api-types/PasskeyLoginRequest";
import type { SessionPackage } from "@/api-types/SessionPackage";
import type { StartLoginRequest } from "@/api-types/StartLoginRequest";
import type { StartLoginResponse } from "@/api-types/StartLoginResponse";
import { ErrorDisplay, useError } from "@/components";
import { ConfirmationCodeInput } from "@/components/otp";
import { OPERATION_MODE } from "@/constants";
import { authorize_operation } from "@/core";
import { resolveApiRequest } from "@/utils";
import { SESSION_QUERY_KEY } from "./query";

const login_schema = z.object({
  email: z.email(),
});

const confirmation_schema = z.object({
  confirmation_code: z.string().length(6),
});

type ConfirmationForm = z.infer<typeof confirmation_schema>;
type LoginForm = z.infer<typeof login_schema>;

export function LoginView() {
  const error = useError();
  const queryClient = useQueryClient();
  const [verified_email, setVerifiedEmail] = useState<string | null>(null);

  const loginWithPasskey = useCallback(
    async (email: string, challenge: string, known_credentials: string[]) => {
      const auth_result = await error.catch(
        "Error authorizing with passkey",
        () =>
          authorize_operation({
            allowed_credentials: known_credentials,
            challenge,
          }),
      );

      if (!auth_result.ok) {
        return;
      }

      const completion_result = await error.catch(
        "Error completing login",
        () =>
          resolveApiRequest<SessionPackage>("/api/auth/login/passkey", {
            method: "POST",
            body: JSON.stringify({
              owner: email,
              auth_response: auth_result.result as AuthorizationResponse,
            } satisfies PasskeyLoginRequest),
          }),
      );

      if (!completion_result.ok) {
        return;
      }

      queryClient.resetQueries({ queryKey: SESSION_QUERY_KEY });
      toast("Login successful!", { variant: "success" });
    },
    [error.catch, queryClient],
  );

  const login_form = useForm({
    defaultValues: {
      email: "",
    } satisfies LoginForm,
    onSubmit: async (data) => {
      const response = await error.catch("Error starting login", () =>
        resolveApiRequest<StartLoginResponse>("/api/auth/login/start", {
          body: JSON.stringify({
            email_only: data.meta.email_only,
            email_address: data.value.email,
          } satisfies StartLoginRequest),
          method: "POST",
        }),
      );

      if (!response.ok) {
        return;
      }

      if (
        data.meta.email_only ||
        response.result.known_credentials.length === 0
      ) {
        if (!data.meta.email_only) {
          toast(
            `No passkeys registered under ${OPERATION_MODE.toLowerCase()} application, create a passkey after successful signin`,
            { variant: "warning" },
          );
        }
        setVerifiedEmail(data.value.email);
      } else {
        loginWithPasskey(
          data.value.email,
          response.result.challenge,
          response.result.known_credentials,
        );
      }
    },
    onSubmitMeta: { email_only: false },
  });

  const confirmation_form = useForm({
    defaultValues: {
      confirmation_code: "",
    } satisfies ConfirmationForm,
    onSubmit: async (data) => {
      const completion_result = await error.catch(
        "Error completing login",
        () =>
          resolveApiRequest<SessionPackage>("/api/auth/login/email", {
            method: "POST",
            body: JSON.stringify({
              email_address: data.meta.verified_email,
              confirmation_code: data.value.confirmation_code,
            } satisfies EmailLoginRequest),
          }),
      );

      if (!completion_result.ok) {
        return;
      }

      queryClient.resetQueries({ queryKey: SESSION_QUERY_KEY });
      toast("Login successful!", { variant: "success" });
    },
    onSubmitMeta: { verified_email: "" },
  });
  const onSubmit: SubmitEventHandler = useCallback(
    (event) => {
      event.preventDefault();

      if (!verified_email) {
        const email_only =
          (event.submitter as HTMLButtonElement)?.value === "true";

        login_form.handleSubmit({ email_only });
      } else {
        confirmation_form.handleSubmit({ verified_email });
      }
    },
    [login_form.handleSubmit, confirmation_form.handleSubmit, verified_email],
  );

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <login_form.Field name="email">
        {(field) => (
          <TextField
            variant="secondary"
            isReadOnly={verified_email !== null}
            isInvalid={field.state.meta.isTouched && !field.state.meta.isValid}
          >
            <Label htmlFor="id">Email address</Label>
            <Input
              autoComplete="email webauthn"
              spellCheck={false}
              type="email"
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.currentTarget.value)}
            />
            <Description>
              Use this option if you don't have a passkey registered on this
              device.
            </Description>
          </TextField>
        )}
      </login_form.Field>

      {verified_email !== null && (
        <confirmation_form.Field name="confirmation_code">
          {(field) => (
            <ConfirmationCodeInput
              kind="EmailSignIn"
              onConfirmation={field.handleChange}
              owner={verified_email}
            />
          )}
        </confirmation_form.Field>
      )}

      <ErrorDisplay value={error.value} />

      <div className="flex">
        {verified_email === null && (
          <Button
            size="lg"
            type="submit"
            variant="ghost"
            aria-label="Proceed with Email"
            isDisabled={error.is_pending || !login_form.state.isValid}
            value="true"
          >
            <IconMail className="size-5" />
            Proceed with Email
          </Button>
        )}

        <div className="grow" />

        {verified_email === null && (
          <Button
            aria-label="Proceed with Passkey"
            isDisabled={error.is_pending || !login_form.state.isValid}
            size="lg"
            type="submit"
            value="false"
          >
            <IconFingerprint className="size-5" />
            Proceed with a Passkey
          </Button>
        )}

        {verified_email !== null && (
          <Button
            aria-label="Complete Signin"
            isDisabled={error.is_pending || !confirmation_form.state.isValid}
            size="lg"
            type="submit"
          >
            <IconArrowRight className="size-5" />
            Complete Signin
          </Button>
        )}
      </div>
    </form>
  );
}
