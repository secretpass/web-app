import { Accordion, IconChevronDown, Separator } from "@heroui/react";
import type { ReactNode } from "react";
import { Alert } from "@/components";
import { SimpleMono } from "@/components/command";
import { APP_VERSION } from "@/constants";
import { isSafari } from "@/utils";

export function LocalOfflineInstructions() {
  return (
    <div>
      <h3>Please check the following to resolve the issue:</h3>
      <Accordion className="w-full mt-4">
        {RESOLVE_ITEMS.map((item) => (
          <Accordion.Item key={item.key}>
            <Accordion.Heading>
              <Accordion.Trigger>
                {item.title}
                <Accordion.Indicator>
                  <IconChevronDown />
                </Accordion.Indicator>
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
              <Accordion.Body>{item.content}</Accordion.Body>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
      <Alert status="danger" className="shadow-none bg-background mt-6">
        If the issue persists after trying the above steps, please reach out to{" "}
        <a href="mailto:support@secretpass.cloud">support@secretpass.cloud</a>
      </Alert>
    </div>
  );
}

const RESOLVE_ITEMS: { key: string; title: ReactNode; content: ReactNode }[] = [
  {
    key: "missing-cli",
    title: "Do you have spass cli installed",
    content: (
      <div className="flex flex-col gap-2">
        <div>You can install the spass cli by running</div>
        <SimpleMono value="brew install secretpass/tap/secretpass-cli" />
        <div className="flex items-center gap-4">
          <Separator className="flex-1" />
          Or
          <Separator className="flex-1" />
        </div>
        <SimpleMono
          value={`curl -LsSf https://github.com/secretpass/cli/releases/download/${APP_VERSION}/secretpass-cli-installer.sh | sh`}
        />
      </div>
    ),
  },
  {
    key: "service-down",
    title: "Is Secretpass local service running",
    content: (
      <ul className="list-disc pl-5">
        <li>
          You can check if the service is active by running{" "}
          <SimpleMono value="spass status" />
        </li>
        <li>
          You can start the service by running{" "}
          <SimpleMono value="spass local start" />
        </li>
        <li>
          The service will be started in the background on{" "}
          <SimpleMono value="https://localhost:20206" />, please ensure no other
          service is binding to this port.
        </li>
      </ul>
    ),
  },
  ...(isSafari()
    ? [
        {
          key: "safari-user",
          title: "Using Safari on MacOS?",
          content: (
            <>
              Safari may block local TLS certificates used by secretpass cli.
              You can fix this by running{" "}
              <SimpleMono value="spass install-certificates" />
            </>
          ),
        },
      ]
    : []),
];
