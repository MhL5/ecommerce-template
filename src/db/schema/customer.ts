/** Things a shopper keeps between visits: addresses, wishlist and cart. */
import { sql } from "drizzle-orm";
import {
  boolean,
  char,
  check,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { product, productVariant } from "./catalog";
import { discount } from "./checkout";
import { createdAt, id, timestamps } from "./columns";

const address = pgTable(
  "address",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    /** Optional nickname, e.g. "Home" or "Work". */
    label: text("label"),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    company: text("company"),
    address1: text("address1").notNull(),
    address2: text("address2"),
    city: text("city").notNull(),
    region: text("region").notNull(),
    postalCode: text("postal_code").notNull(),
    /** ISO 3166-1 alpha-2, e.g. "US". */
    country: char("country", { length: 2 }).notNull(),
    phone: text("phone"),
    isDefaultShipping: boolean("is_default_shipping").notNull().default(false),
    isDefaultBilling: boolean("is_default_billing").notNull().default(false),
    ...timestamps,
  },
  (t) => [index("address_user_id_idx").on(t.userId)],
);

const wishlistItem = pgTable(
  "wishlist_item",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.productId] })],
);

/**
 * A signed-in user's cart, or a guest cart found by the `token` in a cookie.
 * Merge the guest cart into the user's cart on sign-in.
 */
const cart = pgTable(
  "cart",
  {
    id: id(),
    userId: text("user_id")
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    token: text("token").unique(),
    discountId: uuid("discount_id").references(() => discount.id, {
      onDelete: "set null",
    }),
    /** Guest carts can be cleaned up after this. */
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    check(
      "cart_owner_check",
      sql`${t.userId} is not null or ${t.token} is not null`,
    ),
  ],
);

const cartItem = pgTable(
  "cart_item",
  {
    id: id(),
    cartId: uuid("cart_id")
      .notNull()
      .references(() => cart.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariant.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull(),
    ...timestamps,
  },
  (t) => [
    unique("cart_item_cart_variant_uq").on(t.cartId, t.variantId),
    check("cart_item_quantity_check", sql`${t.quantity} > 0`),
  ],
);

export { address, cart, cartItem, wishlistItem };
