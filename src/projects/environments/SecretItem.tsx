import { Button, InputGroup, Label, TextArea, TextField } from "@heroui/react";
import { IconFingerprint, IconLock, IconLockOpen2 } from "@tabler/icons-react";
import clsx from "clsx";
import { useCallback, useMemo, useState } from "react";
import type { SecretWithEncryptedValues } from "@/api-types/SecretWithEncryptedValues";
import { useDecryptionParams } from "@/auth/useAuthorization";
import { useError } from "@/components";

export function SecretItem({ definition }: SecretWithEncryptedValues) {
  const error = useError();
  const [plain_value, setPlainValue] = useState<string | null>(null);
  const locked = useMemo(() => plain_value === null, [plain_value]);
  const get_params = useDecryptionParams(error);

  const toggleLock = useCallback(async () => {
    if (locked) {
      setPlainValue(null);
    }

    const params_op = await get_params("secret decryption", { toast: true });
    if (!params_op.ok) {
      return;
    }
  }, [locked, get_params]);

  return (
    <div className="bg-background-secondary px-6 py-4 rounded-xl flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <div className="w-1/2 md:w-1/3 xl:w-1/4 text-base text-left justify-start font-mono font-light">
          {definition.name}
        </div>
        <InputGroup className="grow" variant={locked ? "secondary" : "primary"}>
          <InputGroup.TextArea
            placeholder={locked ? "--ENCRYPTED-SECRET--" : "SECRET VALUE..."}
            defaultValue={definition.comments}
            className="field-sizing-content resize-none max-h-16"
          />
        </InputGroup>
        <Button
          isIconOnly
          variant="ghost"
          size="sm"
          className={clsx(
            locked ? "hover:text-yellow-800" : "hover:text-success",
          )}
          onClick={toggleLock}
        >
          {locked && <IconLock className="size-5" />}
          {!locked && <IconLockOpen2 className="size-5" />}
        </Button>
      </div>
      {!locked && (
        <TextField>
          <Label>Comments</Label>
          <TextArea
            className="field-sizing-content resize-none max-h-16"
            value={definition.comments}
          />
        </TextField>
      )}
      {!locked && (
        <div className="flex justify-end">
          <Button>
            <IconFingerprint className="size-5" /> Update Secret
          </Button>
        </div>
      )}
    </div>
  );
}
