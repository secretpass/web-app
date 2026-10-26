import { toast } from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import * as uuid from "uuid";
import * as z from "zod";
import type { CreateUserRequest } from "@/api-types/CreateUserRequest";
import type { PasskeyCreationResult } from "@/api-types/PasskeyCreationResult";
import type { PublicKeyGenerateResult } from "@/api-types/PublicKeyGenerateResult";
import type { SessionPackage } from "@/api-types/SessionPackage";
import type { ErrorHook } from "@/components/error";
import { generateChallenge } from "@/components/otp";
import { create_passkey, generate_public_keys } from "@/core";
import { resolveApiRequest } from "@/utils";
import { SESSION_QUERY_KEY } from "../query";

const signup_schema = z.object({
  profile: z.object({
    id: z.string(),
    email: z.email(),
    name: z.string().min(2),
  }),
  confirmation: z.object({
    confirmation_code: z.string(),
    passkey_name: z.string(),
  }),
  passkey: z.object({
    challenge: z.string(),
    create_result: z.string(),
  }),
});

export type SignupFormData = z.infer<typeof signup_schema>;

export function useSignupForm(error: ErrorHook) {
  const [started, setStarted] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm({
    defaultValues: {
      profile: {
        id: uuid.v7(),
        name: "",
        email: "",
      },
      confirmation: {
        passkey_name: "",
        confirmation_code: "",
      },
      passkey: {
        challenge: "",
        create_result: "",
      },
    } satisfies SignupFormData,
    validators: { onChange: signup_schema, onMount: signup_schema },
    onSubmit: async ({
      value: { profile, passkey, confirmation },
      formApi,
    }) => {
      if (passkey.challenge === "") {
        const challenge_op = await error.catch(
          "Error creating passkey challenge",
          () => generateChallenge("PasskeySignup", profile.email),
          { capture: "signup_generate_passkey_challenge" },
        );
        if (!challenge_op.ok) {
          return;
        }

        const create_op = await error.catch(
          "Error creating passkey",
          () =>
            create_passkey({
              challenge: challenge_op.result.challenge,
              email: profile.email,
              full_name: profile.name,
              exclude_keys: [],
              user_id: profile.id,
            }),
          { capture: "signup_create_passkey" },
        );
        if (!create_op.ok) {
          return;
        }

        // Intentionally allow temporary failure allowing the user to resend the challenge
        await error.catch(
          "Temporary error sending email code",
          () => generateChallenge("EmailSignup", profile.email),
          {
            toast: true,
            capture: "signup_send_email_challenge",
          },
        );

        formApi.setFieldValue("passkey", {
          challenge: challenge_op.result.challenge,
          create_result: JSON.stringify(create_op.result),
        });

        setStarted(true);
        return;
      }

      const passkey_id = uuid.v7();
      const create_result: PasskeyCreationResult = JSON.parse(
        passkey.create_result,
      );

      const pubkey_op = await error.catch(
        "Error authorizing with passkey",
        () =>
          generate_public_keys({
            challenge: passkey.challenge,
            prf_configs: [
              {
                passkey_id,
                user_id: profile.id,
                cred_id: create_result.id,
              },
            ],
          }),
        { capture: "signup_authorize_create" },
      );

      if (!pubkey_op.ok) {
        return;
      }

      const registration_result = await error.catch(
        "Error creating account",
        () =>
          resolveApiRequest<SessionPackage>("/api/auth/register", {
            method: "POST",
            body: JSON.stringify({
              id: profile.id,
              email: profile.email,
              name: profile.name,
              passkey_id,
              passkey_name: confirmation.passkey_name,
              confirmation_code: confirmation.confirmation_code,
              passkey_result: create_result,
              public_key_result: pubkey_op.result as PublicKeyGenerateResult,
            } satisfies CreateUserRequest),
          }),
        {
          capture: "signup_complete",
        },
      );

      if (!registration_result.ok) {
        return;
      }

      queryClient.setQueryData(SESSION_QUERY_KEY, registration_result.result);

      toast("Registration successful!", { variant: "success" });
    },
  });

  return { started, form };
}
