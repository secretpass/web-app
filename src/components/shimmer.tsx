import { Skeleton } from "@heroui/react";
import clsx from "clsx";
import { Activity, type ReactNode } from "react";

export interface ShimmerProps {
  active: boolean;
  hidden?: boolean;
  className?: string;
  children: ReactNode;
}

export function Shimmer({ active, hidden, className, children }: ShimmerProps) {
  return (
    <>
      {active && <Skeleton className={clsx("h-5", className)} />}
      <Activity mode={active || hidden ? "hidden" : "visible"}>
        {children}
      </Activity>
    </>
  );
}
