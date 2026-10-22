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
import { useVisibleAction } from "@/hooks/useVisible";

export function ViewSecret() {
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
        SECRET_NAME
        <div>
          {!is_locked && (
            <Tooltip>
              <Button
                isIconOnly
                variant="ghost"
                size="sm"
                className="text-muted hover:text-danger"
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
            // onClick={is_locked ? unlock : reset}
          >
            {is_locked && <IconLock className="size-5" />}
            {!is_locked && <IconLockOpen className="size-5" />}
          </Button>
        </div>
      </div>
      <Description>Secret description</Description>
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
              <Button type="button" isDisabled={!is_valid}>
                <IconFingerprint /> Authorize and update
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
