import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

import { relations } from "./db/relations";

const db = drizzle(process.env.NEXT_DATABASE_URL!, { relations });

export { db };
