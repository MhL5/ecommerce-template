import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  pgEnum,
  pgTable,
  smallint,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { product } from "./catalog";
import { id, timestamps } from "./columns";

const reviewStatus = pgEnum("review_status", [
  "pending",
  "published",
  "rejected",
]);

const review = pgTable(
  "review",
  {
    id: id(),
    productId: uuid("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    /** `null` once the author's account is deleted; `authorName` stays. */
    userId: text("user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    authorName: text("author_name").notNull(),
    rating: smallint("rating").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    status: reviewStatus("status").notNull().default("published"),
    /** The author bought this product in a delivered order. */
    isVerifiedPurchase: boolean("is_verified_purchase")
      .notNull()
      .default(false),
    ...timestamps,
  },
  (t) => [
    index("review_product_id_idx").on(t.productId, t.status),
    unique("review_product_user_uq").on(t.productId, t.userId),
    check("review_rating_check", sql`${t.rating} between 1 and 5`),
  ],
);

export { review, reviewStatus };
