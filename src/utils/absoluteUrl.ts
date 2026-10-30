import { isProd } from "@/utils/isProd";

const domainUrl = isProd()
  ? `${process.env["NEXT_PUBLIC_FRONTEND_DOMAIN"]}`
  : `http://localhost:${process.env["PORT"] || 3000}`;

/**
 * Generates an absolute URL for the given path
 * removes ending slash and duplicate slashes
 *
 * @example absoluteUrl("/blogs") => "https://mhl5.vercel.app/blogs"
 */
function absoluteUrl(path: `/${string}`) {
  return removeEndingSlash(new URL(normalizePath(path), domainUrl).href);
}

/**
 * Removes duplicate slashes
 * @example normalizePath("/path//to//resource") => "/path/to/resource"
 */
function normalizePath(path: `/${string}`) {
  return path === "/" ? "" : path.replace(/\/{2,}/g, "/");
}

/**
 * Removes ending slash
 * @example removeEndingSlash("https://example.com/") => "https://example.com"
 */
function removeEndingSlash(path: string) {
  return path.endsWith("/") ? path.slice(0, -1) : path;
}

export { absoluteUrl, domainUrl };
