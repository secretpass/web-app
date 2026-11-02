import { Button, IconPlus, toast } from "@heroui/react";
import {
  IconCloud,
  IconDeviceLaptop,
  IconLockAccess,
} from "@tabler/icons-react";
import clsx from "clsx";
import { useCallback } from "react";
import TimeAgo from "react-timeago";
import type { Passkey } from "@/api-types/Passkey";
import type { User } from "@/api-types/User";
import { useSession } from "@/auth";
import { Alert, useError } from "@/components";
import { generateChallenge } from "@/components/otp";
import { SectionHeader } from "@/components/sections/header";
import { OPERATION_MODE } from "@/constants";
import { authorize_operation } from "@/core";
import { CreatePasskeyButton } from "@/user/CreatePasskey";

export function PasskeysList() {
  const session = useSession();
  const environment_passkeys = session.passkeys.filter(
    (passkey) => passkey.type === OPERATION_MODE,
  );

  return (
    <div>
      <SectionHeader title="Your Passkeys">
        <CreatePasskeyButton
          variant={environment_passkeys.length === 0 ? "primary" : "ghost"}
        >
          <IconPlus />
          Add a new passkey
        </CreatePasskeyButton>
      </SectionHeader>

      <div className="bg-surface px-4 py-6 rounded-xl">
        {environment_passkeys.length === 0 && (
          <Alert
            status="warning"
            title={`${OPERATION_MODE} passkey missing`}
            className="my-8 shadow-none bg-background"
          >
            <p>
              You don't have a {OPERATION_MODE.toLowerCase()} passkey setup, you
              won't be able to access secrets without a passkey. Click add a new
              passkey to setup.
            </p>
          </Alert>
        )}

        <div className="grid gap-x-6 gap-y-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {session.passkeys.map((passkey) => (
            <PasskeyItem
              key={passkey.cred_id}
              passkey={passkey}
              user={session.user}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PasskeyItem({ passkey, user }: { passkey: Passkey; user: User }) {
  const error = useError();
  const onVerify = useCallback(async () => {
    const challenge_op = await error.catch(
      "Error creating challenge",
      () => generateChallenge("PasskeyAuthorize", user.email),
      { toast: true },
    );

    if (!challenge_op.ok) {
      return;
    }

    const authorize_op = await error.catch(
      "Error authorizing passkey check",
      () =>
        authorize_operation({
          challenge: challenge_op.result.challenge,
          allowed_credentials: [passkey.cred_id],
        }),
      { toast: true },
    );

    if (authorize_op.ok) {
      toast(`${passkey.name} is usable on this device!`, {
        variant: "success",
      });
    }
  }, [user.email, passkey.cred_id, passkey.name, error.catch]);

  return (
    <div className="group bg-background hover:bg-background-secondary p-4 rounded-xl flex gap-4 items-start">
      <IconLockAccess
        className={clsx(
          "size-6",
          passkey.type === OPERATION_MODE ? "" : "text-muted",
        )}
      />
      <div className="flex flex-col gap-2 grow">
        <div className="flex justify-between h-6 items-start">
          <div
            className={clsx(
              "grow",
              passkey.type === OPERATION_MODE ? "font-semibold" : "text-muted",
            )}
          >
            {passkey.name}
          </div>
          {passkey.type === OPERATION_MODE && (
            <Button
              className="hidden group-hover:flex h-auto"
              size="sm"
              variant="outline"
              onClick={onVerify}
            >
              Check
            </Button>
          )}

          {passkey.type === "Cloud" && (
            <IconCloud className="size-4 text-muted" />
          )}
          {passkey.type === "Local" && (
            <IconDeviceLaptop className="size-4 text-muted" />
          )}
        </div>
        <div className="text-muted flex gap-2 text-sm">
          {passkey.type !== OPERATION_MODE && (
            <div className="text-sm text-muted font-light hidden group-hover:flex h-auto">
              {passkey.type} only
            </div>
          )}
          <div className="grow" />
          <TimeAgo date={passkey.created_at} />
        </div>
      </div>
    </div>
  );
}
