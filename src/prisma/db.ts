import postgres from "@prisma/orm-postgres/runtime";
import { contractFromJson } from "@prisma/orm-postgres/static";

import type { Contract } from "./contract";
import contractJson from "./contract.json" with { type: "json" };

const contract = contractFromJson<Contract>(contractJson);

/** Process-wide client. Scripts call `db.close()` when done; servers never do. */
const db = postgres({ contract, url: process.env["NEXT_DATABASE_URL"] });

export { contract, db };
