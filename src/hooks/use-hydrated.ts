import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

/** `false` during SSR and hydration, `true` once running on the client. */
function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

export { useHydrated };
