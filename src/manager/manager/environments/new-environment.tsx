import {
  Button,
  IconPlus,
  Input,
  Label,
  TextArea,
  TextField,
} from "@heroui/react";
import { IconFingerprint, IconX } from "@tabler/icons-react";
import clsx from "clsx";
import { useCallback, useMemo, useState } from "react";
import { ErrorDisplay, useError } from "@/components";
import { SAFE_NAME_SCHEMA } from "@/constants";
import type { SecretManagerConfig } from "@/types";
import { resolveRequest } from "@/utils";

export function CreateEnvironment() {
  const [active, setActive] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const error = useError();

  const is_valid = useMemo(() => SAFE_NAME_SCHEMA.validate(name), [name]);

  const reset = useCallback(() => {
    setActive(false);
    setName("");
    setDescription("");
  }, []);

  return (
    <div
      className={clsx(
        "flex flex-col gap-4 py-2 mt-6 rounded-2xl",
        active && "bg-background-tertiary px-4",
        !active && "bg-background",
      )}
    >
      {active && (
        <>
          <div className="text-xl flex justify-between items-center">
            Create Environment
            <Button isIconOnly variant="ghost" onClick={() => reset()}>
              <IconX className="size-6 hover:text-danger" />
            </Button>
          </div>
          <TextField isInvalid={!!name && !is_valid}>
            <Label>Secret name</Label>
            <Input
              placeholder="MY-ENV..."
              value={name}
              onChange={(evt) => setName(evt.currentTarget.value)}
            />
          </TextField>
          <TextField>
            <Label>Description</Label>
            <TextArea
              placeholder="Help other's identify the purpose of this environment"
              value={description}
              onChange={(evt) => setDescription(evt.currentTarget.value)}
            />
          </TextField>
          <Button isDisabled={!is_valid} fullWidth>
            <IconFingerprint /> Authorize and Create
          </Button>
        </>
      )}

      <ErrorDisplay value={error.value} />

      {!active && (
        <Button fullWidth variant="tertiary" onClick={() => setActive(true)}>
          <IconPlus /> New Environment
        </Button>
      )}
    </div>
  );
}
