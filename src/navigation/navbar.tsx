import { Button, Dropdown, IconChevronDown, Link } from "@heroui/react";
import {
  IconCloud,
  IconCloudFilled,
  IconDeviceLaptop,
  IconExternalLink,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import { useSessionQuery } from "@/auth";
import { DropdownItem, type DropdownItemProps, Logo } from "@/components";
import { isCloud, isLocal } from "@/constants";
import { ThemeToggle } from "@/features/theme/theme-toggle";
import { COMMUNITY_LINKS, RESOURCES_LINKS } from "./links";
import { UserProfileButton } from "./profile";

export function Navbar() {
  const session = useSessionQuery();

  return (
    <nav className="sticky top-0 z-50 w-full bg-background backdrop-blur supports-backdrop-filter:bg-background/60">
      <header className="container mx-auto">
        <div className="flex grow h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 no-underline">
            <Logo className="size-7" />
            <span className="text-2xl font-bold">Secretpass</span>
            {isLocal && (
              <span className="text-2xl font-bold text-muted">Local</span>
            )}
            {isCloud && (
              <span className="text-2xl font-bold text-muted">Cloud</span>
            )}
            {isLocal && <IconDeviceLaptop className="size-7 text-muted" />}
            {isCloud && <IconCloud className="size-7 text-muted" />}
          </Link>

          {!session.isSuccess && (
            <nav className="hidden md:flex items-center gap-3">
              <LinkDropDown items={COMMUNITY_LINKS} label="Community" />
              <LinkDropDown items={RESOURCES_LINKS} label="Resources" />

              <AlternativeButton />
              <div className="flex items-center gap-4 border-l pl-4">
                <ThemeToggle />
              </div>
            </nav>
          )}

          {session.isSuccess && (
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <UserProfileButton user={session.data.user} />
            </div>
          )}
        </div>
      </header>
    </nav>
  );
}

function AlternativeButton() {
  return (
    <Link
      href={
        isLocal
          ? "https://cloud.secretpass.cloud"
          : "https://local.secretpass.cloud"
      }
      target="_blank"
      className="no-underline"
    >
      <Button size="sm">
        {isLocal && (
          <>
            <IconCloudFilled className="size-4" /> Cloud
          </>
        )}
        {isCloud && (
          <>
            <IconDeviceLaptop className="size-4" /> Local
          </>
        )}
        <IconExternalLink className="size-4" />
      </Button>
    </Link>
  );
}

function LinkDropDown({
  items,
  label,
}: {
  items: DropdownItemProps[];
  label: ReactNode;
}) {
  return (
    <Dropdown>
      <Dropdown.Trigger>
        <div className="button button--md button--ghost w-full md:w-auto justify-start">
          {label}
          <IconChevronDown />
        </div>
      </Dropdown.Trigger>
      <Dropdown.Popover>
        <Dropdown.Menu>
          {items.map((item) => (
            <DropdownItem key={item.href} {...item} />
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
