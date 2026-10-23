import * as z from "zod";

export { ENCRYPTION_ALGORITHMS } from "./algorithm";

export enum UiTheme {
  Dark = "dark",
  Light = "light",
  System = "system",
}

export enum OperationMode {
  Local = "Local",
  Cloud = "Cloud",
}

export const CWD_HEADER = "x-current-working-directory";

export const SAFE_NAME_SCHEMA = z
  .string()
  .min(1)
  .regex(/^[a-zA-Z_][a-zA-Z0-9_-]*$/, {
    message:
      "Must be a valid environment variable name (letters, numbers, underscores, cannot start with a number).",
  });

export const OPERATION_MODE = (import.meta.env.VITE_OPERATION_MODE ??
  OperationMode.Local) as OperationMode;
export const isLocal = OPERATION_MODE === OperationMode.Local;
export const isCloud = OPERATION_MODE === OperationMode.Cloud;

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
