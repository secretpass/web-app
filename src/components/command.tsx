import { IconCopyCheckFilled, IconCopyFilled } from "@tabler/icons-react";
import clsx from "clsx";
import { type ReactNode, useCallback, useEffect, useState } from "react";

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
        "bg-slate-900 text-white whitespace-pre-wrap max-w-full overflow-auto",
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

export function SimpleMono({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => setCopied(true));
  }, [value]);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = setTimeout(() => setCopied(false), 1000);
    return () => clearTimeout(timeout);
  }, [copied]);

  return (
    <button
      className={clsx(
        "font-mono text-yellow-700 group relative text-left break-all",
        className,
      )}
      onClick={copy}
      type="button"
    >
      {value}
      {!copied && (
        <IconCopyFilled className="absolute size-5 -top-0.5 -mr-2 right-0.5 cursor-pointer text-muted hover:text-foreground hidden group-hover:inline" />
      )}
      {copied && (
        <IconCopyCheckFilled className="absolute size-5 -top-0.5 -mr-2 right-0.5 text-success" />
      )}
    </button>
  );
}
