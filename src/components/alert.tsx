import {
  Alert as HeroAlert,
  type AlertProps as HeroAlertProps,
} from "@heroui/react";
import type { ReactNode } from "react";

export interface AlertProps {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
  status?: HeroAlertProps["status"];
  action?: ReactNode;
}

export function Alert({
  title,
  children,
  className,
  status,
  action,
}: AlertProps) {
  return (
    <HeroAlert status={status} className={className}>
      <HeroAlert.Indicator />
      <HeroAlert.Content>
        <HeroAlert.Title>{title}</HeroAlert.Title>
        <HeroAlert.Description className="w-full overflow-x-auto">
          {children}
        </HeroAlert.Description>
        <span className="sm:hidden">{action}</span>
      </HeroAlert.Content>
      <span className="hidden sm:block">{action}</span>
    </HeroAlert>
  );
}
