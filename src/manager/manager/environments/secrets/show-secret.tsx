import {
  Button,
  Description,
  Label,
  TextArea,
  TextField,
  Tooltip,
  toast,
} from "@heroui/react";
import {
  IconFingerprint,
  IconLock,
  IconLockOpen,
  IconTrash,
} from "@tabler/icons-react";
import clsx from "clsx";
import { useCallback, useMemo, useRef, useState } from "react";
import { ErrorDisplay, useError } from "@/components";
import {
  authorize_operation,
  type DecryptSecretParams,
  decrypt_secret,
  type SecretDefinition,
  type SecretpassEnvironment,
} from "@/core/web";
import { useVisibleAction } from "@/hooks/useVisible";
import { useSecretManager } from "@/manager/provider";
import { resolveRequest } from "@/utils";
import { useCreateOrUpdateSecret } from "./shared";

interface ViewSecretProps {
  environment: SecretpassEnvironment;
  secret: SecretDefinition;
}

export function ViewSecret({ environment, secret }: ViewSecretProps) {
  const manager = useSecretManager();
  const error = useError();
  const [is_locked, setIsLocked] = useState(true);

  const [decrypted_value, setDecryptedValue] = useState<string>("");
  const [value, setSecretValue] = useState<string>("");

  const is_valid = useMemo(
    () => value.length > 1 && value !== decrypted_value,
    [value, decrypted_value],
  );

  const ref = useRef<HTMLDivElement | null>(null);

  const reset = useCallback(() => {
    setIsLocked(true);
    setSecretValue("");
    setDecryptedValue("");
  }, []);

  const onVisibilityChange = useCallback(
    (visible: boolean) => {
      // Lock only - allowing the user to resume where they left off
      if (!visible) reset();
    },
    [reset],
  );

  useVisibleAction(ref, undefined, onVisibilityChange);

  const onComplete = useCallback(() => {
    setDecryptedValue(value);
    toast(`${secret.name} updated successfully`, { variant: "success" });
  }, [value, secret.name]);

  const updateSecret = useCreateOrUpdateSecret(environment);

  const unlock = useCallback(async () => {
    const encrypted_value =
      manager.lock_package[environment.name]?.encrypted_secrets?.[secret.name];
    if (!encrypted_value) {
      const result = await error.catch(
        "Error unlocking secret",
        () => authorize_operation(JSON.stringify(manager.login_params)),
        { capture: "authorize_edit_empty_secret", toast: true },
      );
      if (!result.ok) {
        return;
      }

      setIsLocked(false);
      setSecretValue("");
      setDecryptedValue("");
      return;
    }

    const params: DecryptSecretParams = {
      login_params: manager.login_params,
      encrypted_secret: encrypted_value,
    };

    const decrypt_result = await error.catch(
      "Error unlocking encrypted secret",
      () => decrypt_secret(JSON.stringify(params)),
      { capture: "decrypt_single_secret", toast: true },
    );
    if (!decrypt_result.ok) {
      return;
    }

    setSecretValue(decrypt_result.result);
    setDecryptedValue(decrypt_result.result);
    setIsLocked(false);
  }, [
    manager,
    manager.lock_package,
    environment.name,
    secret.name,
    error.catch,
  ]);

  const deleteSecret = useCallback(async () => {
    const auth_result = await error.catch(
      "Error authorizing secret deletion",
      () => authorize_operation(JSON.stringify(manager.login_params)),
      {
        capture: "authorize_secret_delete",
      },
    );
    if (!auth_result.ok) {
      return;
    }

    const delete_result = await error.catch(
      "Error deleting secret",
      () =>
        resolveRequest(`/api/secrets/${environment.name}/${secret.name}`, {
          method: "DELETE",
        }),
      { capture: "api_secret_delete" },
    );
    if (!delete_result.ok) {
      return;
    }

    await manager.refreshState(`${secret.name} deleted`);

    onComplete();
  }, [manager, environment.name, secret.name, onComplete, error.catch]);

  return (
    <div
      className={clsx(
        "flex flex-col py-2 px-4 duration-500 gap-2 bg-background rounded-xl",
      )}
    >
      <div
        className={clsx(
          "text-lg flex justify-between items-center font-mono",
          is_locked && "font-light",
        )}
      >
        {secret.name}
        <div>
          {!is_locked && (
            <Tooltip>
              <Button
                isIconOnly
                variant="ghost"
                size="sm"
                className="text-muted hover:text-danger"
                onDoubleClick={deleteSecret}
              >
                <IconTrash className="size-5" />
              </Button>
              <Tooltip.Content>Double click to delete</Tooltip.Content>
            </Tooltip>
          )}
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            className={clsx(
              "text-muted",
              is_locked && "hover:text-warning",
              !is_locked && "hover:text-success",
            )}
            onClick={is_locked ? unlock : reset}
          >
            {is_locked && <IconLock className="size-5" />}
            {!is_locked && <IconLockOpen className="size-5" />}
          </Button>
        </div>
      </div>
      {!!secret.description && <Description>{secret.description}</Description>}
      {!is_locked && (
        <>
          <TextField className="mb-4">
            <Label>Secret value</Label>
            <TextArea
              placeholder="Top secret information here..."
              value={value}
              onChange={(evt) => setSecretValue(evt.currentTarget.value)}
            />
          </TextField>

          <ErrorDisplay value={error.value} />

          {value !== decrypted_value && (
            <div className="flex justify-end mb-4">
              <Button
                type="button"
                isDisabled={!is_valid}
                onClick={() =>
                  updateSecret(secret.name, secret.description, value)
                }
              >
                <IconFingerprint /> Authorize and update
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
