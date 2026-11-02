import { Chip } from "@heroui/react";
import { IconBotId, IconCode, IconKeyFilled } from "@tabler/icons-react";
import TimeAgo from "react-timeago";
import type { MachinePublicKey } from "@/api-types/MachinePublicKey";
import { Alert } from "@/components";
import { SectionHeader } from "@/components/sections/header";
import { CreateMachineKeyDialog } from "./CreateMachineKey";

export function MachinePublicKeyCard({
  public_key,
}: {
  public_key: MachinePublicKey;
}) {
  return (
    <div className="bg-background hover:bg-background-secondary p-4 flex gap-4 items-start rounded-xl">
      <IconKeyFilled className="h-6 w-auto text-muted" />
      <div className="flex flex-col grow gap-1">
        <div className="text-lg">{public_key.name}</div>
        <div className="grow flex gap-4">
          {public_key.environments.map((env_name) => (
            <Chip size="sm" key={env_name}>
              <IconCode className="h-3 w-auto" />
              {env_name}
            </Chip>
          ))}
        </div>
        <div className="text-xs text-muted flex justify-between">
          <span>{public_key.generated_by}</span>
          <TimeAgo date={public_key.generated_on} />
        </div>
      </div>
    </div>
  );
}

export function MachinePublicKeysList({
  public_keys,
  project_id,
}: {
  public_keys: MachinePublicKey[];
  project_id: string;
}) {
  return (
    <div>
      <SectionHeader
        title={
          <>
            <IconBotId className="size-6" /> Machines
          </>
        }
      >
        <CreateMachineKeyDialog project_id={project_id ?? ""} />
      </SectionHeader>
      <div className="bg-surface px-4 py-6 rounded-xl">
        {public_keys.length === 0 && (
          <Alert
            status="warning"
            className="rounded-2xl bg-background shadow-none"
          >
            You don't have any machine private keys at the moment, click
            generate key to generate new keys
          </Alert>
        )}
        <div className="grid gap-x-6 gap-y-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {public_keys.map((public_key) => (
            <MachinePublicKeyCard key={public_key.id} public_key={public_key} />
          ))}
        </div>
      </div>
    </div>
  );
}
