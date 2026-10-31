import { defineConfig as ormConfig } from "@prisma/orm-postgres/config";
import "dotenv/config";
import { definePrismaConfig } from "prisma/config";

export default definePrismaConfig({
  orm: ormConfig({
    contract: "./src/prisma/contract.prisma",
    db: {
      connection: process.env["NEXT_DATABASE_URL"]!,
    },
  }),
});
