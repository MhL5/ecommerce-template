import { createHash } from "node:crypto";

/**
 * Deterministic UUID (v5-style, SHA-1) for a seed key such as `product:p01`.
 * Re-running the seed gives every row the same id, so links, bookmarks and
 * test fixtures that use ids keep working after a reset.
 */
function seedId(key: string) {
  const hash = createHash("sha1").update(`northstar-seed:${key}`).digest();
  hash[6] = (hash[6]! & 0x0f) | 0x50;
  hash[8] = (hash[8]! & 0x3f) | 0x80;
  const hex = hash.subarray(0, 16).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-");
}

export { seedId, slugify };
