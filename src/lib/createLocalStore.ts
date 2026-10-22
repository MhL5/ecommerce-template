import { useSyncExternalStore } from "react";
import type { ZodType } from "zod";

type Updater<T> = T | ((previous: T) => T);

type LocalStore<T> = {
  getState: () => T;
  setState: (updater: Updater<T>) => void;
  subscribe: (listener: () => void) => () => void;
  useStore: () => T;
};

/**
 * A tiny external store persisted to `localStorage`.
 *
 * The server snapshot is always `initialState`, so server HTML and the first
 * client render match; the persisted value takes over right after hydration.
 * Writes from other tabs are picked up through the `storage` event.
 */
function createLocalStore<T>(
  key: string,
  initialState: T,
  schema: ZodType<T>,
): LocalStore<T> {
  const listeners = new Set<() => void>();
  let cachedRaw: string | null | undefined;
  let cachedState: T = initialState;

  function read(): T {
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      return cachedState;
    }

    if (raw === cachedRaw) return cachedState;
    cachedRaw = raw;

    if (raw === null) {
      cachedState = initialState;
      return cachedState;
    }

    try {
      const parsed = schema.safeParse(JSON.parse(raw));
      cachedState = parsed.success ? parsed.data : initialState;
    } catch {
      cachedState = initialState;
    }
    return cachedState;
  }

  function emit() {
    for (const listener of listeners) listener();
  }

  function setState(updater: Updater<T>) {
    const previous = read();
    const next =
      typeof updater === "function"
        ? (updater as (previous: T) => T)(previous)
        : updater;

    const raw = JSON.stringify(next);
    try {
      window.localStorage.setItem(key, raw);
      cachedRaw = raw;
    } catch {
      cachedRaw = undefined;
    }
    cachedState = next;
    emit();
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);

    function onStorage(event: StorageEvent) {
      if (event.key === key) listener();
    }
    window.addEventListener("storage", onStorage);

    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  function getServerSnapshot() {
    return initialState;
  }

  function useStore() {
    return useSyncExternalStore(subscribe, read, getServerSnapshot);
  }

  return { getState: read, setState, subscribe, useStore };
}

export { createLocalStore, type LocalStore };
