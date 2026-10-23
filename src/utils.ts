import { useState } from "react";
import { create } from "zustand";
import { API_BASE_URL } from "./constants";

export type ComplexState<T extends object> = T & {
  readonly reset: () => void;
  readonly update: (value: Partial<T>) => void;
};

export function useComplexState<T extends object>(
  init: (setState: (update: Partial<T>) => void, getState: () => T) => T,
): ComplexState<T> {
  const [useZustandState] = useState(() =>
    create<ComplexState<T>>((setState, getState) => ({
      ...init(setState as (update: Partial<T>) => void, getState),
      update: (value: Partial<T>) =>
        setState(value as Partial<ComplexState<T>>),
      reset: () => {
        setState(init(setState as (update: Partial<T>) => void, getState));
      },
    })),
  );
  return useZustandState();
}

export async function makeApiRequest<T = unknown>(
  path: string,
  init?: RequestInit,
) {
  const headers =
    init?.headers ??
    (init?.body
      ? {
          "Content-Type": "application/json",
        }
      : undefined);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
    mode: "cors",
  });

  const text = await response.text();
  return {
    ok: response.ok,
    status: response.status,
    text,
    headers: response.headers,
    json() {
      return JSON.parse(text) as T;
    },
  };
}

export async function resolveApiRequest<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await makeApiRequest<T>(path, init);

  if (response.ok) {
    if (!response.text) {
      return undefined as unknown as T;
    }
    return response.json();
  }

  return Promise.reject(response.text);
}

export function clone<T>(object: T, update?: (cloned: T) => T): T {
  const cloned: T = JSON.parse(JSON.stringify(object));

  if (update) {
    return update(cloned);
  }
  return cloned;
}
