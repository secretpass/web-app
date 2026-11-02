import { Accordion, IconChevronDown } from "@heroui/react";
import type { ReactNode } from "react";
import { SimpleMono } from "@/components/command";

interface HelpTopicItem {
  title: string;
  details: ReactNode;
}

const HELP_TOPICS: HelpTopicItem[] = [
  {
    title: "Can't see your project?",
    details: (
      <div>
        Please navigate to the project folder and run{" "}
        <SimpleMono value="spass local attach" />. This will give secretpass
        visibility into the project directory.
      </div>
    ),
  },
  {
    title: "Want to setup a new project?",
    details: (
      <div>
        Please navigate to the target folder and run{" "}
        <SimpleMono value="spass local attach" />. The project will appear under
        pending projects and you can proceed to complete the set up.
      </div>
    ),
  },
  {
    title: "Why is my project under pending projects?",
    details:
      "We're assuming this is a new project, click on it under pending projects to complete setup.",
  },
  {
    title: "Why is my project under inaccessible projects?",
    details:
      "The project is attached to secretpass locally but it's not under the current user name, just login with the relevant username to access the project.",
  },
];

export function HelpTopicList() {
  return (
    <Accordion variant="surface" className="w-full max-w-lg mx-auto ">
      {HELP_TOPICS.map((topic) => (
        <Accordion.Item key={topic.title}>
          <Accordion.Heading>
            <Accordion.Trigger>
              {topic.title}
              <Accordion.Indicator>
                <IconChevronDown />
              </Accordion.Indicator>
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <Accordion.Body>{topic.details}</Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
