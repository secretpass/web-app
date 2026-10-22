import { Description } from "@heroui/react";
import clsx from "clsx";
import { useMemo } from "react";
import { CreateEnvironment } from "./new-environment";

export function EnvironmentsSidebar() {
  return (
    <div className="bg-background h-full py-4 px-2 rounded-2xl w-1/3 overflow-y-auto relative grid-cols-1">
      <CreateEnvironment />

      <CreateEnvironment />
    </div>
  );
}

function EnvironmentItem({
  environment,
  is_active,
}: {
  is_active: boolean;
  environment: string;
}) {
  return (
    <button
      className={clsx(
        "flex flex-col w-full mb-3 cursor-pointer py-2 px-4 text-left gap-1 rounded-2xl transition-all duration-300",
        is_active && "bg-surface",
        !is_active && "hover:bg-background-secondary hover:rounded-2xl",
      )}
      type="button"
    >
      <span
        className={clsx(
          "font-mono",
          is_active && "font-semibold",
          !is_active && "font-light",
        )}
      >
        Env name
      </span>
      <Description className="line-clamp-1 truncate">Env desc</Description>
    </button>
  );
}
