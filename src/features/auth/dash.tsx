import {
  Button,
  Card,
  Description,
  Input,
  InputOTP,
  Label,
  Tabs,
  TextField,
} from "@heroui/react";
import { IconFingerprint } from "@tabler/icons-react";
import { type SubmitEventHandler, useCallback, useState } from "react";
import { ErrorDisplay, useError } from "@/components";
import { Alert } from "@/components/alert";

export enum ActiveView {
  Login = "login",
  Register = "register",
}

export function LoginDashboard() {
  const error = useError();
  const [view, setView] = useState<ActiveView>(ActiveView.Login);

  const onSubmit: SubmitEventHandler = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  return (
    <div className="content flex flex-col items-center gap-8">
      <div className="h-[10%]" />
      <Card className="w-full max-w-3xl px-8 py-6">
        <Card.Header>
          <Card.Title className="text-xl font-light mb-4">
            Login or Register
          </Card.Title>
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
        </Card.Header>

        <Card.Content className="mt-6">
          <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            {view === ActiveView.Register && (
              <TextField variant="secondary" isRequired>
                <Label htmlFor="id">Fullname</Label>
                <Input
                  name="name"
                  autoComplete="name"
                  spellCheck={false}
                  type="text"
                />
                <Description>
                  The name associated with your private key
                </Description>
              </TextField>
            )}

            {view === ActiveView.Login && (
              <div className="flex justify-center">
                <Button
                  aria-label="Login"
                  isDisabled={error.is_pending}
                  size="lg"
                  type="submit"
                >
                  <IconFingerprint />
                  Login with a Passkey
                </Button>
              </div>
            )}

            <TextField variant="secondary">
              <Label htmlFor="id">Email address</Label>
              <Input
                name="email_address"
                autoComplete={
                  view === ActiveView.Login ? "email webauthn" : "email"
                }
                spellCheck={false}
                type="email"
              />
              {view === ActiveView.Register && (
                <Description>
                  This email will be associated as the username in projects. You
                  can have multiple passkeys under the same email in different
                  devices.
                </Description>
              )}
              {view === ActiveView.Login && (
                <Description>
                  Email address associated with your passkey, or just click
                  authorize, we'll try to figure it out.
                </Description>
              )}
            </TextField>

            <TextField variant="secondary">
              <Label htmlFor="id">Confirmation Code</Label>
              <Description>
                We've sent a code to someone@secretpas.cloud
              </Description>
              <InputOTP maxLength={6}>
                <InputOTP.Group>
                  <InputOTP.Slot index={0} />
                  <InputOTP.Slot index={1} />
                  <InputOTP.Slot index={2} />
                </InputOTP.Group>
                <InputOTP.Separator />
                <InputOTP.Group>
                  <InputOTP.Slot index={3} />
                  <InputOTP.Slot index={4} />
                  <InputOTP.Slot index={5} />
                </InputOTP.Group>
              </InputOTP>

              <Description>
                Didn't receive the code?{" "}
                <Button
                  size="sm"
                  variant="ghost"
                  className={"underline h-auto"}
                >
                  Resend
                </Button>
              </Description>
            </TextField>

            <ErrorDisplay value={error.value} />

            <div className="flex">
              <div className="grow" />
              {view === ActiveView.Login && (
                <Button
                  aria-label="Login"
                  isDisabled={error.is_pending}
                  size="lg"
                  type="submit"
                >
                  Continue with email
                </Button>
              )}

              {view === ActiveView.Register && (
                <Button
                  aria-label="Login"
                  isDisabled={error.is_pending}
                  size="lg"
                  type="submit"
                >
                  Continue with email
                </Button>
              )}
            </div>
          </form>
        </Card.Content>
        {view === ActiveView.Login && (
          <Card.Footer className="mt-4">
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
                <li>
                  The new passkey must be added to each project for it to access
                  secrets.
                </li>
              </ul>
            </Alert>
          </Card.Footer>
        )}
      </Card>
    </div>
  );
}
