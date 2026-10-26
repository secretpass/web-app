import {
  Button,
  Description,
  Input,
  Label,
  TextField,
  toast,
} from "@heroui/react";
import { IconArrowRight, IconFingerprint, IconMail } from "@tabler/icons-react";
import { useForm, useSelector } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { type SubmitEventHandler, useCallback, useState } from "react";
import * as z from "zod";
import type { EmailLoginRequest } from "@/api-types/EmailLoginRequest";
import type { PasskeyAuthorizationResult } from "@/api-types/PasskeyAuthorizationResult";
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
  email_address: z.email(),
  confirmation_code: z.string(),
});

type SignInFormData = z.infer<typeof login_schema>;

export function SignInForm() {
  const error = useError();
  const queryClient = useQueryClient();
  const [started, setStarted] = useState(false);

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
        "Error completing signing in process",
        () =>
          resolveApiRequest<SessionPackage>("/api/auth/login/passkey", {
            method: "POST",
            body: JSON.stringify({
              owner: email,
              auth_response: auth_result.result as PasskeyAuthorizationResult,
            } satisfies PasskeyLoginRequest),
          }),
      );

      if (!completion_result.ok) {
        return;
      }

      queryClient.setQueryData(SESSION_QUERY_KEY, completion_result.result);
      toast("Login successful!", { variant: "success" });
    },
    [error.catch, queryClient],
  );

  const form = useForm({
    defaultValues: {
      email_address: "",
      confirmation_code: "",
    } satisfies SignInFormData,
    validators: { onChange: login_schema, onMount: login_schema },
    onSubmit: async ({
      value: { email_address, confirmation_code },
      meta: { email_only },
    }) => {
      if (confirmation_code) {
        const completion_result = await error.catch(
          "Error completing login",
          () =>
            resolveApiRequest<SessionPackage>("/api/auth/login/email", {
              method: "POST",
              body: JSON.stringify({
                email_address,
                confirmation_code,
              } satisfies EmailLoginRequest),
            }),
        );

        if (!completion_result.ok) {
          return;
        }

        queryClient.setQueryData(SESSION_QUERY_KEY, completion_result.result);
        toast("Login successful!", { variant: "success" });

        return;
      }

      const start_op = await error.catch("Error starting sign in process", () =>
        resolveApiRequest<StartLoginResponse>("/api/auth/login/start", {
          body: JSON.stringify({
            email_only: email_only,
            email_address,
          } satisfies StartLoginRequest),
          method: "POST",
        }),
      );

      if (!start_op.ok) {
        return;
      }

      if (email_only || start_op.result.known_credentials.length === 0) {
        if (!email_only) {
          toast(
            `No passkeys registered under ${OPERATION_MODE.toLowerCase()} application, create a passkey after successful signin`,
            { variant: "warning" },
          );
        }

        setStarted(true);
      } else {
        loginWithPasskey(
          email_address,
          start_op.result.challenge,
          start_op.result.known_credentials,
        );
      }
    },
    onSubmitMeta: { email_only: false },
  });

  const email_valid = useSelector(
    form.store,
    (state) => state.fieldMeta.email_address?.isValid,
  );

  const onSubmit: SubmitEventHandler = useCallback(
    (event) => {
      event.preventDefault();

      const email_only =
        (event.submitter as HTMLButtonElement)?.value === "true";

      form.handleSubmit({ email_only });
    },
    [form.handleSubmit],
  );

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <form.Field name="email_address">
        {(field) => (
          <TextField
            variant="secondary"
            isReadOnly={started}
            isInvalid={field.state.meta.isTouched && !field.state.meta.isValid}
            isRequired
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
      </form.Field>

      {started && (
        <form.Field name="confirmation_code">
          {(field) => (
            <ConfirmationCodeInput
              kind="EmailSignIn"
              onConfirmation={field.handleChange}
              owner={form.state.values.email_address}
            />
          )}
        </form.Field>
      )}

      <ErrorDisplay value={error.value} />

      <div className="flex">
        {!started && (
          <Button
            size="lg"
            type="submit"
            variant="ghost"
            aria-label="Sign in with Email"
            isDisabled={error.is_pending || !email_valid}
            value="true"
          >
            <IconMail className="size-5" />
            Sign in with Email
          </Button>
        )}

        <div className="grow" />

        {!started && (
          <Button
            aria-label="Proceed with Passkey"
            isDisabled={error.is_pending || !email_valid}
            size="lg"
            type="submit"
            value="false"
          >
            <IconFingerprint className="size-5" />
            Sign in with a Passkey
          </Button>
        )}

        {started && (
          <Button
            aria-label="Complete sign in"
            isDisabled={error.is_pending || !form.state.isValid}
            size="lg"
            type="submit"
          >
            <IconArrowRight className="size-5" />
            Complete sign in
          </Button>
        )}
      </div>
    </form>
  );
}
