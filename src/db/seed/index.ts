/**
 * Seeds the database from the mock data.
 *
 *   pnpm db:seed           # empty database only
 *   pnpm db:seed --reset   # truncate every table, then seed
 *
 * Run `pnpm db:migrate` first. Uses NEXT_DATABASE_URL from `.env`.
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

import { relations } from "../relations";
import { seedDatabase } from "./seed";

async function main() {
  const url = process.env["NEXT_DATABASE_URL"];
  if (!url) throw new Error("NEXT_DATABASE_URL is not set.");

  const db = drizzle(url, { relations });
  const reset = process.argv.includes("--reset");

  try {
    const counts = await seedDatabase(db, { reset });
    // eslint-disable-next-line no-console -- CLI output
    console.info(`Seeded${reset ? " (after reset)" : ""}:`, counts);
  } finally {
    await db.$client.end();
  }
}

main().catch((error: unknown) => {
  // eslint-disable-next-line no-console -- CLI output
  console.error(error);
  process.exitCode = 1;
});
