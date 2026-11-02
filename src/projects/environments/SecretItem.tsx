import { Button, InputGroup } from "@heroui/react";
import {
  IconAlignLeft,
  IconCircleCheck,
  IconFingerprint,
  IconKeyFilled,
  IconLock,
  IconLockOpen2,
} from "@tabler/icons-react";
import clsx from "clsx";
import { useCallback, useMemo, useRef, useState } from "react";
import type { SecretWithEncryptedValues } from "@/api-types/SecretWithEncryptedValues";
import { useDecryptionParams } from "@/auth/useAuthorization";
import { useError } from "@/components";
import {
  type ContributorPublicKey,
  type ContributorSecretValue,
  type DecryptedSecret,
  decrypt_secrets,
} from "@/core";
import { useVisibleAction } from "@/hooks";

export function SecretItem({
  definition,
  contributor_values,
}: SecretWithEncryptedValues) {
  const error = useError();
  const [_tag_values, setTagValues] = useState<DecryptedSecret[] | undefined>(
    undefined,
  );
  const [latest_value, setLatestValue] = useState<string | undefined>(
    undefined,
  );
  const [updated_value, setUpdatedValue] = useState<string | undefined>(
    undefined,
  );
  const [updated_comments, setUpdatedComments] = useState<string | undefined>(
    undefined,
  );

  const locked = useMemo(
    () => typeof latest_value === "undefined",
    [latest_value],
  );
  const get_params = useDecryptionParams(error);

  const unLock = useCallback(async () => {
    const params_op = await get_params("secret decryption", { toast: true });
    if (!params_op.ok) {
      return;
    }

    const decryption_op = await error.catch(
      "Error decrypting secret",
      () =>
        decrypt_secrets({
          auth_request: params_op.result,
          encrypted_secrets: contributor_values as [
            ContributorPublicKey,
            ContributorSecretValue,
          ][],
        }),
      { toast: true },
    );

    if (!decryption_op.ok) {
      return;
    }

    const decrypted_secrets = decryption_op.result.decrypted_secrets;

    setLatestValue(
      decrypted_secrets.find((secret) => secret.tag === "latest")
        ?.plain_value ?? "",
    );
    setTagValues(decrypted_secrets.filter((secret) => secret.tag !== "latest"));
  }, [get_params, error.catch, contributor_values]);

  const reset = useCallback(() => {
    setTagValues(undefined);
    setLatestValue(undefined);
    setUpdatedValue(undefined);
    setUpdatedComments(undefined);
    error.reset();
  }, [error.reset]);

  const onVisibilityChange = useCallback(
    (is_visible: boolean) => {
      if (!is_visible) {
        reset();
      }
    },
    [reset],
  );

  const ref = useRef<HTMLDivElement | null>(null);

  useVisibleAction(ref, undefined, onVisibilityChange);

  return (
    <div
      ref={ref}
      className={clsx(
        "bg-background-secondary px-6 py-4 rounded-xl flex flex-col",
      )}
    >
      <div className="flex items-start gap-4">
        <div className="w-1/2 md:w-1/3 xl:w-1/4 text-base text-left justify-start font-mono font-light">
          {definition.name}
        </div>
        <div className={clsx("flex flex-col grow", locked ? "gap-1" : "gap-4")}>
          <InputGroup
            isDisabled={locked}
            variant={locked ? "secondary" : "primary"}
          >
            <InputGroup.Prefix>
              <IconKeyFilled className="text-muted size-5" />
            </InputGroup.Prefix>
            <InputGroup.TextArea
              disabled={locked}
              placeholder={locked ? "--ENCRYPTED-SECRET--" : "SECRET VALUE..."}
              value={updated_value ?? latest_value ?? ""}
              onChange={(evt) => setUpdatedValue(evt.currentTarget.value)}
              className="field-sizing-content resize-none max-h-16 font-mono"
            />
            <InputGroup.Suffix>
              <Button
                className={clsx(
                  "h-auto",
                  typeof updated_value === "undefined" && "hidden",
                  updated_value === latest_value && "hidden",
                )}
                size="sm"
                variant="secondary"
              >
                <IconFingerprint /> Update
              </Button>
            </InputGroup.Suffix>
          </InputGroup>

          <InputGroup
            className={clsx(
              locked && definition.comments.trim().length === 0 && "hidden",
            )}
            isDisabled={locked}
            variant={locked ? "secondary" : "primary"}
          >
            <InputGroup.Prefix>
              <IconAlignLeft className="text-muted size-5" />
            </InputGroup.Prefix>
            <InputGroup.TextArea
              className="field-sizing-content resize-none max-h-16"
              placeholder="Comments..."
              value={updated_comments ?? definition.comments}
              onChange={(evt) => setUpdatedComments(evt.currentTarget.value)}
            />
            <InputGroup.Suffix>
              <Button
                className={clsx(
                  "h-auto",
                  typeof updated_comments === "undefined" && "hidden",
                  updated_comments === definition.comments && "hidden",
                )}
                size="sm"
                variant="secondary"
              >
                <IconCircleCheck /> Update
              </Button>
            </InputGroup.Suffix>
          </InputGroup>
        </div>
        <Button
          isIconOnly
          variant="ghost"
          size="sm"
          className={clsx(
            locked ? "hover:text-yellow-800" : "hover:text-success",
          )}
          onClick={locked ? unLock : reset}
        >
          {locked && <IconLock className="size-5" />}
          {!locked && <IconLockOpen2 className="size-5" />}
        </Button>
      </div>
    </div>
  );
}
