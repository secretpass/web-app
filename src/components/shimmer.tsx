import { Skeleton } from "@heroui/react";
import clsx from "clsx";
import { Activity, type ReactNode } from "react";

export interface ShimmerProps {
  active: boolean;
  className?: string;
  children: ReactNode;
}

export function Shimmer({ active, className, children }: ShimmerProps) {
  return (
    <>
      {active && <Skeleton className={clsx("h-5", className)} />}
      <Activity mode={active ? "hidden" : "visible"}>{children}</Activity>
    </>
  );
}
