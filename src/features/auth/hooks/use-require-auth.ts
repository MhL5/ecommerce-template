import { useSession } from "@/features/auth/hooks/use-session";
import type { UserRole } from "@/features/auth/types";
import { loginHref } from "@/features/auth/utils/redirect";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

type AuthStatus = "loading" | "authorized" | "forbidden";

/**
 * Client-side gate for pages that need a session. There's no server session
 * in this mock, so this is UX only: signed-out visitors are sent to /login
 * with a return URL, and a user without `role` gets `"forbidden"`.
 *
 * Layouts using this must still render their `children` (pages show their
 * own skeleton while `status` is `"loading"`), otherwise Next can't
 * prerender or validate the page segment for instant navigation.
 */
function useRequireAuth(role?: UserRole) {
  const { user, hydrated } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const signedOut = hydrated && !user;

  useEffect(() => {
    if (signedOut) router.replace(loginHref(pathname));
  }, [signedOut, router, pathname]);

  const status: AuthStatus =
    !hydrated || !user
      ? "loading"
      : role && user.role !== role
        ? "forbidden"
        : "authorized";

  return { user, status };
}

export { useRequireAuth, type AuthStatus };
