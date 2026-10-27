import { useCallback, useMemo } from "react";
import type { ErrorHook } from "@/components/error";
import { generateChallenge } from "@/components/otp";
import { authorize_operation } from "@/core";
import { useSession } from "./session.provider";

export function useAuthorization(error: ErrorHook) {
  const { passkeys, user } = useSession();

  const allowed_credentials = useMemo(
    () => passkeys.map((pk) => pk.cred_id),
    [passkeys],
  );

  const authorize = useCallback(
    async (operation: string) => {
      const challenge_op = await error.catch(
        `Error generating ${operation} challenge`,
        () => generateChallenge("PasskeyAuthorize", user.email),
      );
      if (!challenge_op.ok) {
        return challenge_op;
      }

      return await error.catch(`Error authorizing ${operation}`, () =>
        authorize_operation({
          challenge: challenge_op.result.challenge,
          allowed_credentials,
        }),
      );
    },
    [user.email, allowed_credentials, error.catch],
  );

  return authorize;
}
