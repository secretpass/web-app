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
}

export function Alert({ title, children, className, status }: AlertProps) {
  return (
    <HeroAlert status={status} className={className}>
      <HeroAlert.Indicator />
      <HeroAlert.Content>
        <HeroAlert.Title>{title}</HeroAlert.Title>
        <HeroAlert.Description className="max-w-full overflow-x-auto">
          {children}
        </HeroAlert.Description>
      </HeroAlert.Content>
    </HeroAlert>
  );
}
