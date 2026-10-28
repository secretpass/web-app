import { useCallback, useMemo } from "react";
import type { CatchOptions, ErrorHook } from "@/components/error";
import { generateChallenge } from "@/components/otp";
import {
  type AuthorizationRequest,
  authorize_operation,
  type DecryptionAuthorizationRequest,
} from "@/core";
import { useSession } from "./session.provider";

export function useAuthorizationParams(error: ErrorHook) {
  const { passkeys, user } = useSession();

  const allowed_credentials = useMemo(
    () => passkeys.map((pk) => pk.cred_id),
    [passkeys],
  );

  const compileParams = useCallback(
    async (operation: string, options?: CatchOptions) =>
      error.catch(
        `Error generating ${operation} challenge`,
        () =>
          generateChallenge("PasskeyAuthorize", user.email).then(
            ({ challenge }) =>
              ({
                challenge,
                allowed_credentials,
              }) satisfies AuthorizationRequest,
          ),
        options,
      ),
    [user.email, allowed_credentials, error.catch],
  );

  return compileParams;
}

export function useDecryptionParams(error: ErrorHook) {
  const { passkeys, user } = useSession();

  const prf_configs = useMemo(
    () =>
      passkeys.map((pk) => ({
        cred_id: pk.cred_id,
        passkey_id: pk.cred_id,
        user_id: user.id,
      })),
    [passkeys, user.id],
  );

  const compileParams = useCallback(
    async (operation: string, options?: CatchOptions) =>
      error.catch(
        `Error generating ${operation} challenge`,
        () =>
          generateChallenge("PasskeyAuthorize", user.email).then(
            ({ challenge }) =>
              ({
                challenge,
                prf_configs,
              }) satisfies DecryptionAuthorizationRequest,
          ),
        options,
      ),
    [user.email, prf_configs, error.catch],
  );

  return compileParams;
}

export function useAuthorization(error: ErrorHook) {
  const compileParams = useAuthorizationParams(error);

  const authorize = useCallback(
    async (operation: string, options?: CatchOptions) => {
      const params_op = await compileParams(operation);
      if (!params_op.ok) {
        return params_op;
      }

      return await error.catch(
        `Error authorizing ${operation}`,
        () => authorize_operation(params_op.result),
        options,
      );
    },
    [compileParams, error.catch],
  );

  return authorize;
}
