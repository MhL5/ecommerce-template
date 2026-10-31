import { defineConfig as ormConfig } from "@prisma/orm-postgres/config";
import "dotenv/config";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { definePrismaConfig } from "prisma/config";

// Prisma expands a relative glob into an absolute path with backslashes on
// Windows, which the glob matcher reads as escapes and matches nothing. An
// absolute pattern with forward slashes works on every platform.
const root = dirname(fileURLToPath(import.meta.url)).replaceAll("\\", "/");

export default definePrismaConfig({
  orm: ormConfig({
    // Every .prisma file in the folder is one contract, split by domain.
    contract: `${root}/src/prisma/schema/**/*.prisma`,
    // Keep contract.json / contract.d.ts beside db.ts, not inside schema/.
    output: "./src/prisma",
    db: {
      connection: process.env["NEXT_DATABASE_URL"]!,
    },
  }),
});
