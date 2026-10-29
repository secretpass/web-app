import { Dropdown } from "@heroui/react";
import { IconExternalLink, type TablerIcon } from "@tabler/icons-react";
import clsx from "clsx";
import type { MouseEventHandler } from "react";
import { useAnalytics } from "@/shared/analytics/provider";

export interface DropdownItemProps {
  label: string;
  Icon: TablerIcon;
  href?: string;
  capture?: string;
  is_external?: boolean;
  onClick?: MouseEventHandler;
  variant?: "danger";
}

export function DropdownItem({
  capture,
  Icon,
  label,
  href,
  is_external,
  onClick,
  variant,
}: DropdownItemProps) {
  const analytics = useAnalytics();

  return (
    <Dropdown.Item
      onClick={(evt) => {
        onClick?.(evt);
        if (capture) {
          analytics?.capture(capture);
        }
      }}
      className="flex items-center gap-2"
      key={href || label}
      href={href}
      target="_blank"
      variant={variant}
    >
      <Icon className={clsx("size-5", variant === "danger" && "text-danger")} />
      <span className="grow">{label}</span>
      {is_external && <IconExternalLink className="size-4" />}
    </Dropdown.Item>
  );
}
