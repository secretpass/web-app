import { Button, Description } from "@heroui/react";
import { IconFingerprint, IconFolder } from "@tabler/icons-react";
import { useCallback } from "react";
import { ErrorDisplay, useError } from "@/components";
import { LoadingCircle } from "@/components/loader";
import {
  register_user,
  type SecretpassProject,
  type SecretpassUser,
} from "@/core";
import { useAnalytics } from "@/features/analytics/provider";
import type { RegistrationState } from "@/features/setup/project/types.ts";
import type { SecretManagerConfig } from "@/types";
import { type ComplexState, resolveApiRequest } from "@/utils.ts";

interface CompletionScreenProps {
  state: ComplexState<RegistrationState>;
  directory: string;
  onAuthComplete: (public_key_id: string) => void;
}

export function CompletionScreen({
  state,
  onAuthComplete,
  directory,
}: CompletionScreenProps) {
  const error = useError();
  const analytics = useAnalytics();

  return (
    <div className="flex flex-col justify-center items-center gap-10 grow">
      <div className="text-center">
        <h1 className="text-2xl text-muted">
          Create{" "}
          <span className="font-semibold text-foreground">
            {state.project_name}
          </span>{" "}
        </h1>
        <Description>{state.description}</Description>
      </div>

      <kbd className="font-mono text-white bg-black px-6 py-4 flex items-center gap-4">
        <IconFolder />
        {directory}/.spass
      </kbd>

      <ErrorDisplay value={error.value} />

      <Button
        isDisabled={error.is_pending}
        aria-label="Register Passkey"
        size="lg"
      >
        {!error.is_pending && <IconFingerprint />}
        {error.is_pending && (
          <LoadingCircle aria-label="Loading" size="sm" isIndeterminate />
        )}
        Authorize and Create Project
      </Button>
    </div>
  );
}
