/**
 * Seeds the database from the mock data.
 *
 *   pnpm db:seed           # empty database only
 *   pnpm db:seed --reset   # truncate every table, then seed
 *
 * Run `pnpm db:update` first. Uses NEXT_DATABASE_URL from `.env`.
 */
import "dotenv/config";

import { seedDatabase } from "./seed";

async function main() {
  if (!process.env["NEXT_DATABASE_URL"])
    throw new Error("NEXT_DATABASE_URL is not set.");

  // Imported after dotenv so the client sees NEXT_DATABASE_URL.
  const { db } = await import("@/prisma/db");
  const reset = process.argv.includes("--reset");

  try {
    const counts = await seedDatabase(db, { reset });
    // eslint-disable-next-line no-console -- CLI output
    console.info(`Seeded${reset ? " (after reset)" : ""}:`, counts);
  } finally {
    await db.close();
  }
}

main().catch((error: unknown) => {
  // eslint-disable-next-line no-console -- CLI output
  console.error(error);
  process.exitCode = 1;
});
