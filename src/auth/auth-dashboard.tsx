import { Card, Tabs } from "@heroui/react";
import { Activity, useState } from "react";
import { useError } from "@/components";
import { Alert } from "@/components/alert";
import { Shimmer } from "@/components/shimmer";
import { LoginView } from "./login";
import { RegistrationView } from "./register";

export enum ActiveView {
  Login = "login",
  Register = "register",
}

interface AuthDashboardProps {
  isPending: boolean;
}

export function AuthDashboard({ isPending }: AuthDashboardProps) {
  const error = useError();
  const [view, setView] = useState<ActiveView>(ActiveView.Login);

  return (
    <div className="content flex flex-col items-center gap-8">
      <div className="h-[10%]" />
      <Card className="w-full max-w-3xl px-8 py-6">
        <Card.Header>
          <Card.Title className="text-xl font-light mb-4">
            <Shimmer active={isPending} className="w-1/2 h-6">
              Login or Register
            </Shimmer>
          </Card.Title>
          <Shimmer active={isPending} className="w-full h-8">
            <Tabs
              className="w-full"
              variant="secondary"
              isDisabled={error.is_pending}
              selectedKey={view}
              onSelectionChange={(key) => setView(key as ActiveView)}
            >
              <Tabs.ListContainer>
                <Tabs.List>
                  <Tabs.Tab id={ActiveView.Login}>
                    <Tabs.Indicator />
                    Login
                  </Tabs.Tab>
                  <Tabs.Tab id={ActiveView.Register}>
                    <Tabs.Indicator />
                    Register
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>
            </Tabs>
          </Shimmer>
        </Card.Header>

        <Card.Content className="mt-6">
          <Shimmer active={isPending} className="w-full h-32">
            <Activity mode={view === ActiveView.Login ? "visible" : "hidden"}>
              <LoginView />
            </Activity>
            <Activity
              mode={view === ActiveView.Register ? "visible" : "hidden"}
            >
              <RegistrationView />
            </Activity>
          </Shimmer>
        </Card.Content>
        {view === ActiveView.Login && (
          <Card.Footer className="mt-4">
            <Shimmer active={isPending} className="w-full h-24">
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
          </Card.Footer>
        )}
      </Card>
    </div>
  );
}
