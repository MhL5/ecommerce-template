/** Checkout configuration: discount codes and shipping methods. */
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { id, timestamps } from "./columns";

/**
 * - `percent`: `value` is a percentage of the subtotal (10 = 10%)
 * - `fixed`: `value` is cents off the subtotal
 * - `free_shipping`: shipping costs nothing; `value` is ignored
 */
const discountKind = pgEnum("discount_kind", [
  "percent",
  "fixed",
  "free_shipping",
]);

const discount = pgTable(
  "discount",
  {
    id: id(),
    /** Stored upper-case; match codes case-insensitively. */
    code: text("code").notNull().unique(),
    description: text("description").notNull().default(""),
    kind: discountKind("kind").notNull(),
    value: integer("value").notNull().default(0),
    /** Minimum subtotal in cents for the code to apply. */
    minSubtotal: integer("min_subtotal"),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    /** Total redemptions allowed across all customers. */
    usageLimit: integer("usage_limit"),
    usageLimitPerCustomer: integer("usage_limit_per_customer"),
    /** Cached count of `discount_redemption` rows. */
    usedCount: integer("used_count").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (t) => [
    check("discount_value_check", sql`${t.value} >= 0`),
    check(
      "discount_percent_check",
      sql`${t.kind} <> 'percent' or ${t.value} <= 100`,
    ),
  ],
);

const shippingMethod = pgTable("shipping_method", {
  id: id(),
  /** Stable key used in code, e.g. "standard" or "express". */
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  /** Price in integer cents. */
  price: integer("price").notNull(),
  /** Subtotal in cents at or above which shipping is free. */
  freeOverSubtotal: integer("free_over_subtotal"),
  minDeliveryDays: integer("min_delivery_days"),
  maxDeliveryDays: integer("max_delivery_days"),
  isActive: boolean("is_active").notNull().default(true),
  position: integer("position").notNull().default(0),
  ...timestamps,
});

export { discount, discountKind, shippingMethod };
