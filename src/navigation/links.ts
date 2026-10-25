import {
  IconBook,
  IconBook2,
  IconBrandDiscord,
  IconBrandGithub,
  IconBrandMedium,
  IconBrandReddit,
  IconBrandSlack,
} from "@tabler/icons-react";
import type { DropdownItemProps } from "@/components";

export const COMMUNITY_LINKS: DropdownItemProps[] = [
  {
    label: "Slack",
    Icon: IconBrandSlack,
    href: "https://secretpass.cloud/l/s/slack",
    capture: "social-interest-slack",
    is_external: true,
  },
  {
    label: "Github",
    Icon: IconBrandGithub,
    href: "https://secretpass.cloud/l/s/github",
    capture: "social-interest-github",
    is_external: true,
  },
  {
    label: "Reddit",
    Icon: IconBrandReddit,
    href: "https://secretpass.cloud/l/s/reddit",
    capture: "social-interest-reddit",
    is_external: true,
  },
  {
    label: "Discord",
    Icon: IconBrandDiscord,
    href: "https://secretpass.cloud/l/s/discord",
    capture: "social-interest-discord",
    is_external: true,
  },
];

export const RESOURCES_LINKS: DropdownItemProps[] = [
  {
    label: "Docs",
    Icon: IconBook2,
    href: "https://secretpass.cloud/l/docs",
    capture: "resource-interest-docs",
    is_external: true,
  },
  {
    label: "Blog",
    Icon: IconBrandMedium,
    href: "https://secretpass.cloud/l/blog",
    capture: "resource-interest-blog",
    is_external: true,
  },
  {
    label: "Knowledge Base",
    Icon: IconBook,
    href: "https://secretpass.cloud/l/kb",
    capture: "resource-interest-kb",
    is_external: true,
  },
];
