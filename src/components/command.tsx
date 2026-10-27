import clsx from "clsx";
import type { ReactNode } from "react";

export function CommandDisplay({
  children,
  className,
  subtle,
}: {
  children: ReactNode;
  className?: string;
  subtle?: boolean;
}) {
  return (
    <pre
      className={clsx(
        "bg-slate-900 text-white whitespace-pre-wrap",
        subtle
          ? "inline w-auto px-2 py-1 mx-1 rounded-lg"
          : "w-full px-4 py-2 my-1 overflow-x-auto",
        className,
      )}
    >
      {children}
    </pre>
  );
}
