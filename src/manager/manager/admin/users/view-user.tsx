import {
  Button,
  Chip,
  Description,
  Input,
  Label,
  TextField,
} from "@heroui/react";
import {
  IconBotId,
  IconEdit,
  IconFingerprint,
  IconShield,
  IconTrash,
  IconUser,
  IconUserShield,
  IconX,
} from "@tabler/icons-react";
import clsx from "clsx";
import { useState } from "react";
import {
  EnvironmentSelector,
  Select,
  type SelectItem,
} from "@/components/select";
import type { SecretpassUser, UserLevel } from "@/core/web";
import { useSecretManager } from "@/manager/provider";

function UserIcon({
  level,
  className,
}: {
  level: UserLevel;
  className?: string;
}) {
  return (
    <>
      {level === "Standard" && <IconUser className={className} />}
      {level === "Admin" && <IconUserShield className={className} />}
      {level === "Machine" && <IconBotId className={className} />}
    </>
  );
}

const UserLevelItems: SelectItem[] = [
  {
    label: "Admin",
    value: "Admin",
  },
  {
    label: "Standard",
    value: "Standard",
  },
];

export function ViewUser({ user }: { user: SecretpassUser }) {
  const { user: current_user } = useSecretManager();
  const [edit, setEdit] = useState(false);
  return (
    <div
      className={clsx(
        "flex flex-col px-4 pb-4 pt-2 my-4 gap-6 rounded-2xl bg-background",
      )}
    >
      <div className={clsx("flex items-center gap-4")}>
        <UserIcon level={user.level} className="size-8 text-muted" />

        <div className="grow flex flex-col gap-1">
          <div className="flex items-center gap-4 mb-2">
            <span className="grow text-base">{user.name}</span>
            {user.level === "Admin" && !edit && (
              <Chip color="accent">
                <IconShield className="size-4" /> {user.level}
              </Chip>
            )}
            {user.level !== "Admin" && !edit && (
              <div className="flex gap-2 flex-wrap">
                {user.access?.map((env) => (
                  <Chip key={env} color="accent">
                    {env}
                  </Chip>
                ))}
              </div>
            )}
            {edit && (
              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                className="text-muted hover:text-danger"
              >
                <IconTrash />
              </Button>
            )}
            {current_user.level === "Admin" && (
              <Button
                size="sm"
                isIconOnly
                variant="ghost"
                onClick={() => setEdit(!edit)}
                className={clsx(
                  "text-muted",
                  edit && "hover:text-warning",
                  !edit && "hover:text-foreground",
                )}
              >
                {edit && <IconX />}
                {!edit && <IconEdit />}
              </Button>
            )}
          </div>
          {!edit && (
            <div className="flex justify-between">
              <Description>{user.username ?? "bot"}</Description>
              <Description>{user.id}</Description>
            </div>
          )}
        </div>
      </div>

      {edit && (
        <>
          <TextField isReadOnly>
            <Label>Id</Label>
            <Input disabled value={user.id} />
          </TextField>

          {user.level !== "Machine" && (
            <TextField isReadOnly>
              <Label>Username</Label>
              <Input disabled value={user.username} />
              <Description>
                The username is tied to the user's encrypted secrets and cannot
                be changed.
              </Description>
            </TextField>
          )}

          <TextField>
            <Label>Name</Label>
            <Input value={user.name} />
          </TextField>

          {user.level !== "Machine" && (
            <Select<string>
              label="Access Level"
              value={user.level}
              items={UserLevelItems}
            />
          )}

          <EnvironmentSelector<string[]>
            label="Environment access"
            multiselect
            value={user.access || []}
          />

          <div className="flex justify-ebd">
            <Button>
              <IconFingerprint /> Update
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
