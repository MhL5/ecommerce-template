import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

const db = drizzle(process.env.NEXT_DATABASE_URL!);

export { db };
