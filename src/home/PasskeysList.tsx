import { Alert, Button, IconPlus, toast } from "@heroui/react";
import { IconLockAccess } from "@tabler/icons-react";
import { useCallback } from "react";
import TimeAgo from "react-timeago";
import type { Passkey } from "@/api-types/Passkey";
import type { User } from "@/api-types/User";
import { useSession } from "@/auth";
import { useError } from "@/components";
import { generateChallenge } from "@/components/otp";
import { SectionHeader } from "@/components/sections/header";
import { OPERATION_MODE } from "@/constants";
import { authorize_operation } from "@/core";
import { CreatePasskeyButton } from "@/user/CreatePasskey";

export function PasskeysList() {
  const session = useSession();

  return (
    <div className="content mx-auto container">
      <SectionHeader title="Your Passkeys">
        <CreatePasskeyButton
          variant={session.passkeys.length === 0 ? "primary" : "ghost"}
        >
          <IconPlus />
          Add a new passkey
        </CreatePasskeyButton>
      </SectionHeader>

      <div className="bg-surface px-4 py-6 rounded-xl">
        {session.passkeys.length === 0 && (
          <Alert
            status="warning"
            title={`${OPERATION_MODE} passkey missing`}
            className="my-8 shadow-none"
          >
            You don't have a passkey setup, you won't be able to access secrets
            without a passkey.
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
      () => generateChallenge("EmailAuthorize", user.email),
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
      <IconLockAccess className="size-6" />
      <div className="flex flex-col gap-2 grow">
        <div className="font-semibold flex justify-between h-6 items-start">
          {passkey.name}
          <Button
            className="hidden group-hover:flex h-auto"
            size="sm"
            variant="outline"
            onClick={onVerify}
          >
            Check
          </Button>
        </div>
        <div className="text-muted flex justify-end text-sm">
          <TimeAgo date={passkey.created_at} />
        </div>
      </div>
    </div>
  );
}
