import {
  Description,
  Dropdown,
  Header,
  IconChevronDown,
  Label,
  Separator,
} from "@heroui/react";
import {
  IconCloudFilled,
  IconDeviceLaptop,
  IconLogout2,
  IconUserCircle,
} from "@tabler/icons-react";
import { type MouseEventHandler, useCallback } from "react";
import type { User } from "@/api-types/User";
import { useLogoutMutation } from "@/auth/query";
import { DropdownItem, useError } from "@/components";
import { isCloud, isLocal } from "@/constants";
import { COMMUNITY_LINKS, RESOURCES_LINKS } from "./links";

export function UserProfileButton({ user }: { user: User }) {
  const error = useError();
  const logout = useLogoutMutation();
  const logoutCallback: MouseEventHandler = useCallback(() => {
    error
      .catch("Error while attempting to logout", () => logout.mutateAsync(), {
        capture: "logout",
        toast: true,
      })
      .catch();
  }, [error.catch, logout.mutateAsync]);

  return (
    <Dropdown>
      <Dropdown.Trigger>
        <div className="button button--md button--ghost h-auto">
          <IconUserCircle className="size-8" />
          <div className="flex grow flex-col text-left">
            <Label>{user.name}</Label>
            <Description>{user.email}</Description>
          </div>
          <IconChevronDown />
        </div>
      </Dropdown.Trigger>
      <Dropdown.Popover>
        <Dropdown.Menu>
          {isLocal && (
            <DropdownItem
              is_external
              href="https://cloud.secretpass.cloud"
              Icon={IconCloudFilled}
              label="Cloud"
              capture="local-to-cloud-interest"
            />
          )}
          {isCloud && (
            <DropdownItem
              is_external
              href="https://local.secretpass.cloud"
              Icon={IconDeviceLaptop}
              label="Local"
              capture="cloud-to-local-interest"
            />
          )}
          <Separator />
          <Dropdown.Section>
            <Header>Community</Header>
            {COMMUNITY_LINKS.map((item) => (
              <DropdownItem key={item.href} {...item} />
            ))}
          </Dropdown.Section>
          <Dropdown.Section>
            <Header>Resources</Header>
            {RESOURCES_LINKS.map((item) => (
              <DropdownItem key={item.href} {...item} />
            ))}
          </Dropdown.Section>
          <Separator />
          <DropdownItem
            variant="danger"
            capture="logout"
            label="Logout"
            Icon={IconLogout2}
            onClick={logoutCallback}
          />
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
