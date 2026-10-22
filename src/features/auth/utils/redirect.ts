import type { Route } from "next";

/**
 * Only same-site paths are allowed as post-login destinations, so a crafted
 * `?redirect=https://evil.example` can't bounce users off-site.
 */
function safeRedirect(
  value: string | null | undefined,
  fallback: Route = "/account",
): Route {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/\\")
  ) {
    return fallback;
  }
  return value as Route;
}

function loginHref(redirectTo: string): Route {
  return `/login?redirect=${encodeURIComponent(redirectTo)}` as Route;
}

export { loginHref, safeRedirect };
