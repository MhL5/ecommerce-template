/**
 * Orders. Everything an order shows (names, options, prices, addresses) is
 * copied onto it at checkout, so editing or deleting products, discounts or
 * shipping methods never changes an old order.
 */
import { sql } from "drizzle-orm";
import {
  char,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { product, productVariant } from "./catalog";
import { discount, shippingMethod } from "./checkout";
import { createdAt, id, timestamps } from "./columns";

/** Snapshot of an address at checkout. */
type OrderAddress = {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone?: string;
};

/** Snapshot of the option values on the variant that was bought. */
type OrderItemOption = { name: string; value: string };

const orderStatus = pgEnum("order_status", [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);

const paymentStatus = pgEnum("payment_status", [
  "pending",
  "authorized",
  "paid",
  "failed",
  "refunded",
  "partially_refunded",
]);

const order = pgTable(
  "order",
  {
    id: id(),
    /** Human-friendly reference shown to customers, e.g. `NS-4F7K2Q`. */
    number: text("number").notNull().unique(),
    /** `null` for guest checkout (or once the account is deleted). */
    userId: text("user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    email: text("email").notNull(),
    status: orderStatus("status").notNull().default("pending"),
    paymentStatus: paymentStatus("payment_status")
      .notNull()
      .default("pending"),
    currency: char("currency", { length: 3 }).notNull().default("USD"),
    // Totals in integer cents.
    subtotal: integer("subtotal").notNull(),
    discountTotal: integer("discount_total").notNull().default(0),
    shippingTotal: integer("shipping_total").notNull().default(0),
    taxTotal: integer("tax_total").notNull().default(0),
    total: integer("total").notNull(),
    discountId: uuid("discount_id").references(() => discount.id, {
      onDelete: "set null",
    }),
    discountCode: text("discount_code"),
    shippingMethodId: uuid("shipping_method_id").references(
      () => shippingMethod.id,
      { onDelete: "set null" },
    ),
    shippingMethodName: text("shipping_method_name").notNull(),
    shippingAddress: jsonb("shipping_address").$type<OrderAddress>().notNull(),
    /** `null` when billing matches shipping. */
    billingAddress: jsonb("billing_address").$type<OrderAddress>(),
    customerNote: text("customer_note"),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index("order_user_id_idx").on(t.userId),
    index("order_email_idx").on(t.email),
    index("order_status_idx").on(t.status),
    index("order_created_at_idx").on(t.createdAt),
  ],
);

const orderItem = pgTable(
  "order_item",
  {
    id: id(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => order.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => product.id, {
      onDelete: "set null",
    }),
    variantId: uuid("variant_id").references(() => productVariant.id, {
      onDelete: "set null",
    }),
    productName: text("product_name").notNull(),
    productSlug: text("product_slug").notNull(),
    brandName: text("brand_name"),
    /** e.g. "Red / XL"; empty for products without options. */
    variantTitle: text("variant_title").notNull().default(""),
    options: jsonb("options").$type<OrderItemOption[]>().notNull().default([]),
    sku: text("sku"),
    image: text("image"),
    /** Unit price in cents at checkout. */
    unitPrice: integer("unit_price").notNull(),
    quantity: integer("quantity").notNull(),
    /** `unitPrice * quantity`, in cents. */
    lineTotal: integer("line_total").notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    index("order_item_order_id_idx").on(t.orderId),
    index("order_item_variant_id_idx").on(t.variantId),
    check("order_item_quantity_check", sql`${t.quantity} > 0`),
  ],
);

/** Status timeline shown on the order page and in the admin. */
const orderStatusEvent = pgTable(
  "order_status_event",
  {
    id: id(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => order.id, { onDelete: "cascade" }),
    status: orderStatus("status").notNull(),
    note: text("note"),
    /** Admin or customer who made the change; `null` for the system. */
    actorId: text("actor_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: createdAt(),
  },
  (t) => [index("order_status_event_order_id_idx").on(t.orderId)],
);

/** A payment attempt or refund against an order, from any provider. */
const payment = pgTable(
  "payment",
  {
    id: id(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => order.id, { onDelete: "cascade" }),
    /** e.g. "mock", "stripe". */
    provider: text("provider").notNull(),
    /** The provider's id for this payment (charge / intent id). */
    providerReference: text("provider_reference"),
    status: paymentStatus("status").notNull().default("pending"),
    /** Amount in cents. */
    amount: integer("amount").notNull(),
    refundedAmount: integer("refunded_amount").notNull().default(0),
    currency: char("currency", { length: 3 }).notNull().default("USD"),
    cardBrand: text("card_brand"),
    cardLast4: char("card_last4", { length: 4 }),
    failureReason: text("failure_reason"),
    ...timestamps,
  },
  (t) => [
    index("payment_order_id_idx").on(t.orderId),
    index("payment_provider_reference_idx").on(
      t.provider,
      t.providerReference,
    ),
  ],
);

/** One use of a discount code, for usage limits and reporting. */
const discountRedemption = pgTable(
  "discount_redemption",
  {
    id: id(),
    discountId: uuid("discount_id")
      .notNull()
      .references(() => discount.id, { onDelete: "cascade" }),
    orderId: uuid("order_id")
      .notNull()
      .references(() => order.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    email: text("email").notNull(),
    /** Cents taken off the order. */
    amount: integer("amount").notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    unique("discount_redemption_discount_order_uq").on(
      t.discountId,
      t.orderId,
    ),
    index("discount_redemption_discount_email_idx").on(t.discountId, t.email),
  ],
);

export {
  discountRedemption,
  order,
  orderItem,
  orderStatus,
  orderStatusEvent,
  payment,
  paymentStatus,
  type OrderAddress,
  type OrderItemOption,
};
