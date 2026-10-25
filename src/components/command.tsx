import clsx from "clsx";
import type { ReactNode } from "react";

export function CommandDisplay({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <pre
      className={clsx(
        "px-4 py-2 bg-slate-900 text-white w-full overflow-x-auto whitespace-pre-wrap my-1",
        className,
      )}
    >
      {children}
    </pre>
  );
}
