import {
  Button,
  Description,
  FieldError,
  InputOTP,
  Label,
  TextField,
} from "@heroui/react";
import clsx from "clsx";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChallengeKind } from "@/api-types/ChallengeKind";
import type { CheckChallengeRequest } from "@/api-types/CheckChallengeRequest";
import type { CheckChallengeResult } from "@/api-types/CheckChallengeResult";
import type { GenerateChallengeRequest } from "@/api-types/GenerateChallengeRequest";
import type { GenerateChallengeResponse } from "@/api-types/GenerateChallengeResponse";
import { resolveApiRequest } from "@/utils";
import { ErrorDisplay, useError } from "./error";

const CODE_PATTERN = /[^ABCDEFGHJKLMNPQRSTUVWXYZ23456789]/g;

export async function generateChallenge(kind: ChallengeKind, owner: string) {
  return resolveApiRequest<GenerateChallengeResponse>("/api/auth/challenge", {
    method: "POST",
    body: JSON.stringify({
      kind,
      owner,
    } satisfies GenerateChallengeRequest),
  });
}

const MAX_RESENDS = 5;
const DEFAULT_WAIT_TIME = 60;

export function ConfirmationCodeInput({
  kind,
  owner,
  onConfirmation,
}: {
  kind: ChallengeKind;
  owner: string;
  onConfirmation: (final_value: string) => void;
}) {
  const error = useError();
  const [send_count, setSendCount] = useState(0);
  const [wait_time, setWaitTime] = useState(DEFAULT_WAIT_TIME);
  const [value, setValue] = useState("");
  const [check_result, setCheckResult] = useState<CheckChallengeResult | null>(
    null,
  );
  const is_valid = useMemo(
    () => check_result?.valid ?? null,
    [check_result?.valid],
  );

  const sendConfirmationCode = useCallback(async () => {
    const response = await error.catch("Error sending confirmation code", () =>
      generateChallenge(kind, owner),
    );
    setSendCount((current) => current + 1);
    if (!response.ok) {
      return Promise.reject(response.error);
    }

    setWaitTime(DEFAULT_WAIT_TIME);
  }, [error.catch, kind, owner]);

  useEffect(() => {
    if (wait_time <= 0) {
      return;
    }

    const timeout = setTimeout(
      () => setWaitTime((current) => current - 1),
      1000,
    );
    return () => clearTimeout(timeout);
  });

  const onComplete = useCallback(async () => {
    const result = await error.catch("Error checking code validity", () =>
      resolveApiRequest<CheckChallengeResult>("/api/auth/challenge/check", {
        method: "POST",
        body: JSON.stringify({
          kind,
          owner,
          value,
        } satisfies CheckChallengeRequest),
      }),
    );

    if (!result.ok) {
      return;
    }

    setCheckResult(result.result);
    if (result.result.valid) {
      onConfirmation(value);
    }
  }, [kind, owner, value, error.catch, onConfirmation]);

  return (
    <TextField isInvalid={is_valid === false}>
      <Label className={clsx(is_valid && "text-success")}>
        Confirmation Code
      </Label>
      {is_valid === null && (
        <Description>We've sent a code to {owner}</Description>
      )}

      <InputOTP
        isDisabled={error.is_pending}
        readOnly={check_result?.valid}
        isInvalid={is_valid === false}
        variant="secondary"
        maxLength={6}
        value={value}
        onChange={(newValue) =>
          setValue(newValue.toUpperCase().replace(CODE_PATTERN, ""))
        }
        onComplete={onComplete}
      >
        <InputOTP.Group>
          <InputOTP.Slot index={0} />
          <InputOTP.Slot index={1} />
          <InputOTP.Slot index={2} />
        </InputOTP.Group>
        <InputOTP.Separator />
        <InputOTP.Group>
          <InputOTP.Slot index={3} />
          <InputOTP.Slot index={4} />
          <InputOTP.Slot index={5} />
        </InputOTP.Group>
      </InputOTP>

      <FieldError>
        Invalid confirmation code, {check_result?.attempts_left} attempts left
      </FieldError>

      <ErrorDisplay value={error.value} />

      {is_valid === null && (
        <Description>
          Didn't receive the code?{" "}
          {send_count < MAX_RESENDS && (
            <Button
              isDisabled={wait_time > 0 || error.is_pending}
              size="sm"
              variant="ghost"
              className={"underline h-auto"}
              onClick={() => sendConfirmationCode()}
            >
              Resend {wait_time > 0 ? `(${wait_time} s)` : ""}
            </Button>
          )}
          {send_count >= MAX_RESENDS &&
            "please contact our support team to help resolve the issue"}
        </Description>
      )}
      {is_valid && (
        <Description className="text-success">
          Your code checks out! We trust you, for now.
        </Description>
      )}
    </TextField>
  );
}
