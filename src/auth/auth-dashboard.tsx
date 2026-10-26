import { Button, Card, Tabs } from "@heroui/react";
import { IconRefresh } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { Activity, useState } from "react";
import { Alert } from "@/components/alert";
import { Shimmer } from "@/components/shimmer";
import { isCloud, isLocal } from "@/constants";
import { LocalOfflineInstructions } from "./offline-instructions";
import { SESSION_QUERY_KEY } from "./query";
import { SignInForm } from "./SignIn";
import { SignupForm } from "./signup";

export enum ActiveView {
  SignIn = "sign-in",
  Signup = "signup",
}

interface AuthDashboardProps {
  isPending: boolean;
  disconnected: boolean;
}

const CONNECTED_TITLE = "Sign in or Create account";
const DISCONNECTED_TITLE = isLocal
  ? "Offline - Local service is unreachable"
  : "Offline - Cloud connection refused";

export function AuthDashboard({ isPending, disconnected }: AuthDashboardProps) {
  const queryClient = useQueryClient();
  const [view, setView] = useState<ActiveView>(ActiveView.SignIn);

  return (
    <div className="content flex flex-col items-center gap-8">
      <div className="h-[10%]" />
      <Card className="w-full max-w-3xl px-8 py-6">
        <Card.Header>
          <Card.Title className="text-xl font-light mb-4">
            <Shimmer active={isPending} className="w-1/2 h-6">
              {disconnected ? DISCONNECTED_TITLE : CONNECTED_TITLE}
            </Shimmer>
          </Card.Title>
          <Shimmer
            active={isPending}
            hidden={disconnected}
            className="w-full h-8"
          >
            <Tabs
              className="w-full"
              variant="secondary"
              selectedKey={view}
              onSelectionChange={(key) => setView(key as ActiveView)}
            >
              <Tabs.ListContainer>
                <Tabs.List>
                  <Tabs.Tab id={ActiveView.SignIn}>
                    <Tabs.Indicator />
                    Sign in
                  </Tabs.Tab>
                  <Tabs.Tab id={ActiveView.Signup}>
                    <Tabs.Indicator />
                    Create Account
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>
            </Tabs>
          </Shimmer>
        </Card.Header>

        <Card.Content className="mt-6">
          <Shimmer active={isPending} className="w-full h-32">
            <Activity
              mode={
                view === ActiveView.SignIn && !disconnected
                  ? "visible"
                  : "hidden"
              }
            >
              <SignInForm />
            </Activity>
            <Activity
              mode={
                view === ActiveView.Signup && !disconnected
                  ? "visible"
                  : "hidden"
              }
            >
              <SignupForm />
            </Activity>

            {disconnected && isCloud && (
              <Alert
                title="Please check your internet connection"
                status="danger"
                className="shadow-none bg-background"
              >
                The application cannot establish a connection with the cloud
                backend, please resolve the connection issue and retry.
                <br />
                If the issue persists, please reach out to{" "}
                <a href="mailto:support@secretpass.cloud">
                  support@secretpass.cloud
                </a>
              </Alert>
            )}
            {disconnected && isLocal && <LocalOfflineInstructions />}
          </Shimmer>
        </Card.Content>
        {view === ActiveView.SignIn && (
          <Card.Footer className="mt-4">
            <Shimmer
              active={isPending}
              hidden={disconnected}
              className="w-full h-24"
            >
              <Alert
                status="warning"
                title="Email login limitations"
                className="max-w-3xl bg-background shadow-none flex gap-2 text-sm"
              >
                <ul className="list-disc list-inside">
                  <li>
                    If you login with your email, you'll still need your passkey
                    to view secrets.
                  </li>
                  <li>
                    If this is a new device, you can create a new passkey after
                    logging in.
                  </li>
                  <li>Passkeys are not shared between local and cloud.</li>
                  <li>
                    The new passkey must be added to each project for it to
                    access secrets.
                  </li>
                </ul>
              </Alert>
            </Shimmer>
            {disconnected && (
              <div className="flex justify-end w-full">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() =>
                    queryClient.resetQueries({ queryKey: SESSION_QUERY_KEY })
                  }
                >
                  <IconRefresh className="size-5" />
                  Reload
                </Button>
              </div>
            )}
          </Card.Footer>
        )}
      </Card>
    </div>
  );
}
