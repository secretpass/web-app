import { toast } from "@heroui/react";
import clsx from "clsx";
import { Activity, useCallback, useState } from "react";
import { useAnalytics } from "@/features/analytics/provider";
import { Alert } from "./alert";

export type ErrorValue = { title: string; content: string };

export const ABORT_ERROR = "CATCH_ABORT_ERROR";

export type UnsafeFunction<T> = () => Promise<T>;
export type UnsafeEvaluationResult<T> =
  | { ok: true; result: T }
  | { ok: false; error: unknown };

export interface CatchOptions {
  capture?: string;
  toast?: boolean;
}

export function useError() {
  const [value, setValue] = useState<ErrorValue | null>(null);
  const [is_pending, setIsPending] = useState<boolean>(false);

  const reset = useCallback(() => {
    setValue(null);
    setIsPending(false);
  }, []);

  const analytics = useAnalytics();
  const catch_error = useCallback(
    async <T,>(
      title: string,
      unsafe: UnsafeFunction<T>,
      options?: CatchOptions,
    ): Promise<UnsafeEvaluationResult<T>> => {
      setIsPending(true);
      try {
        const result = await unsafe();
        setValue(null);
        if (options?.capture) {
          analytics?.capture(options.capture, { success: true });
        }

        return {
          ok: true,
          result,
        };
      } catch (error) {
        if (error === ABORT_ERROR) {
          return {
            ok: false,
            error: "",
          };
        }

        setValue({ title, content: String(error) });
        if (options?.capture) {
          analytics?.capture(options.capture, { success: true });
          analytics?.captureException(error, { source: options.capture });
        }

        if (options?.toast) {
          toast(title, {
            variant: "danger",
            description: String(error),
          });
        }

        return {
          ok: false,
          error,
        };
      } finally {
        setIsPending(false);
      }
    },
    [analytics],
  );

  return {
    value,
    reset,
    is_pending,
    catch: catch_error,
  };
}

export type ErrorHook = ReturnType<typeof useError>;

export function ErrorDisplay({
  value,
  className,
}: {
  value: ErrorValue | null;
  className?: string;
}) {
  return (
    <Activity mode={value ? "visible" : "hidden"}>
      <Alert
        title={value?.title}
        className={clsx("max-w-full", className)}
        status="danger"
      >
        {value?.content}
      </Alert>
    </Activity>
  );
}
