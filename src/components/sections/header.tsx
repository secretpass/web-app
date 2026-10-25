import clsx from "clsx";
import type { ReactNode } from "react";

export interface SectionHeaderProps {
  className?: string;
  title: ReactNode;
  children?: ReactNode;
}

export function PageHeader({ className, title, children }: SectionHeaderProps) {
  return (
    <div
      className={clsx(
        "flex items-end mt-8 mb-4 border-b gap-4 py-2",
        className,
      )}
    >
      <h3 className="text-4xl pt-4">{title}</h3>
      <div className="grow" />
      {children}
    </div>
  );
}

export function SectionHeader({
  className,
  title,
  children,
}: SectionHeaderProps) {
  return (
    <div
      className={clsx(
        "flex items-end mt-8 mb-4 border-b gap-4 py-2",
        className,
      )}
    >
      <h3 className="text-2xl font-light pt-4">{title}</h3>
      <div className="grow" />
      {children}
    </div>
  );
}
