import { Accordion, IconChevronDown } from "@heroui/react";
import type { ReactNode } from "react";
import { Alert, CommandDisplay } from "@/components";

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
      <p>
        You can install the spass cli by running:
        <br />
        <CommandDisplay className="font-mono">
          brew install spass
        </CommandDisplay>
      </p>
    ),
  },
  {
    key: "service-down",
    title: "Is Secretpass local service running",
    content: (
      <p>
        You can check if the service is active by running
        <br />
        <CommandDisplay className="font-mono">spass status</CommandDisplay>
        <br />
        You can start the service by running:
        <br />
        <CommandDisplay className="font-mono">spass start</CommandDisplay>
        <br />
        The service will be started in the background on port{" "}
        <strong>20206</strong>, please ensure no other service is binding to the
        port.
      </p>
    ),
  },
];
