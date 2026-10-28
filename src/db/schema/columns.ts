import { timestamp, uuid } from "drizzle-orm/pg-core";

/** Primary key for domain tables (auth tables use Better Auth's text ids). */
const id = () => uuid("id").primaryKey().defaultRandom();

const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

const timestamps = {
  createdAt: createdAt(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export { createdAt, id, timestamps };
