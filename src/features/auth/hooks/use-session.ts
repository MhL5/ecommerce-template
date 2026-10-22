import { useSessionUser } from "@/features/auth/api/auth-store";
import { useHydrated } from "@/hooks/use-hydrated";

/**
 * Current user plus a `hydrated` flag. Before hydration the user always
 * reads as `null`, so wait for `hydrated` before redirecting anyone.
 */
function useSession() {
  const user = useSessionUser();
  const hydrated = useHydrated();
  return { user, hydrated, isAdmin: user?.role === "admin" };
}

export { useSession };
