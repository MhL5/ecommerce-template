/**
 * Catalog: categories, brands and products.
 *
 * A product is the thing a customer browses; a variant is the thing they buy.
 * Products declare options (Color, Size, …) with values (Red, XL, …) and every
 * sellable combination is a variant with its own SKU, price, stock and images.
 * A product without options still has exactly one default variant, so prices
 * and stock always live on `product_variant`.
 *
 * See docs/adr/0001-product-variants-and-attributes.md.
 */
import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { id, timestamps } from "./columns";

const productStatus = pgEnum("product_status", ["draft", "active", "archived"]);

const category = pgTable(
  "category",
  {
    id: id(),
    /** Parent category for nesting, e.g. Clothing → Shirts. */
    parentId: uuid("parent_id").references((): AnyPgColumn => category.id, {
      onDelete: "set null",
    }),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    image: text("image"),
    position: integer("position").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (t) => [index("category_parent_id_idx").on(t.parentId)],
);

const brand = pgTable("brand", {
  id: id(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  logo: text("logo"),
  ...timestamps,
});

const product = pgTable(
  "product",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    brandId: uuid("brand_id").references(() => brand.id, {
      onDelete: "set null",
    }),
    categoryId: uuid("category_id").references(() => category.id, {
      onDelete: "set null",
    }),
    description: text("description").notNull().default(""),
    /** Short selling points shown above the fold. */
    highlights: text("highlights").array().notNull().default(sql`'{}'`),
    tags: text("tags").array().notNull().default(sql`'{}'`),
    status: productStatus("status").notNull().default("draft"),
    featured: boolean("featured").notNull().default(false),
    /** Cached from published reviews so listings can sort without a join. */
    ratingAverage: numeric("rating_average", {
      precision: 3,
      scale: 2,
      mode: "number",
    })
      .notNull()
      .default(0),
    reviewCount: integer("review_count").notNull().default(0),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    /** Escape hatch for data that doesn't deserve a column or attribute. */
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index("product_category_id_idx").on(t.categoryId),
    index("product_brand_id_idx").on(t.brandId),
    index("product_status_idx").on(t.status),
  ],
);

/** An axis a product varies on, e.g. "Color" or "Size". */
const productOption = pgTable(
  "product_option",
  {
    id: id(),
    productId: uuid("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    position: integer("position").notNull().default(0),
  },
  (t) => [unique("product_option_product_name_uq").on(t.productId, t.name)],
);

/** One choice on an option, e.g. "Red" for Color. */
const productOptionValue = pgTable(
  "product_option_value",
  {
    id: id(),
    optionId: uuid("option_id")
      .notNull()
      .references(() => productOption.id, { onDelete: "cascade" }),
    value: text("value").notNull(),
    /** Hex colour or image URL for swatch pickers. */
    swatch: text("swatch"),
    position: integer("position").notNull().default(0),
  },
  (t) => [
    unique("product_option_value_option_value_uq").on(t.optionId, t.value),
    // Target for the composite FK that keeps a variant's value on the right option.
    unique("product_option_value_option_id_uq").on(t.optionId, t.id),
  ],
);

/** A sellable combination of option values (or the single default variant). */
const productVariant = pgTable(
  "product_variant",
  {
    id: id(),
    productId: uuid("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    sku: text("sku").unique(),
    barcode: text("barcode"),
    /** Display name built from the option values, e.g. "Red / XL". */
    title: text("title").notNull().default(""),
    /** Price in integer cents. */
    price: integer("price").notNull(),
    /** Original price in cents when the variant is on sale. */
    compareAtPrice: integer("compare_at_price"),
    /** What the shop paid, in cents, for margin reports. */
    costPrice: integer("cost_price"),
    stock: integer("stock").notNull().default(0),
    trackInventory: boolean("track_inventory").notNull().default(true),
    allowBackorder: boolean("allow_backorder").notNull().default(false),
    weightGrams: integer("weight_grams"),
    isDefault: boolean("is_default").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    position: integer("position").notNull().default(0),
    ...timestamps,
  },
  (t) => [
    index("product_variant_product_id_idx").on(t.productId),
    uniqueIndex("product_variant_one_default_uq")
      .on(t.productId)
      .where(sql`${t.isDefault}`),
    unique("product_variant_product_id_uq").on(t.productId, t.id),
    check("product_variant_price_check", sql`${t.price} >= 0`),
    check(
      "product_variant_compare_at_price_check",
      sql`${t.compareAtPrice} is null or ${t.compareAtPrice} > ${t.price}`,
    ),
  ],
);

/** Which value a variant has for each option (one value per option). */
const productVariantOptionValue = pgTable(
  "product_variant_option_value",
  {
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariant.id, { onDelete: "cascade" }),
    optionId: uuid("option_id")
      .notNull()
      .references(() => productOption.id, { onDelete: "cascade" }),
    optionValueId: uuid("option_value_id").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.variantId, t.optionId] }),
    index("product_variant_option_value_value_idx").on(t.optionValueId),
    foreignKey({
      name: "product_variant_option_value_value_fk",
      columns: [t.optionId, t.optionValueId],
      foreignColumns: [productOptionValue.optionId, productOptionValue.id],
    }).onDelete("cascade"),
  ],
);

/** Product gallery. Images with a `variantId` show when that variant is picked. */
const productImage = pgTable(
  "product_image",
  {
    id: id(),
    productId: uuid("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id"),
    url: text("url").notNull(),
    alt: text("alt").notNull().default(""),
    position: integer("position").notNull().default(0),
    ...timestamps,
  },
  (t) => [
    index("product_image_product_id_idx").on(t.productId),
    foreignKey({
      name: "product_image_variant_fk",
      columns: [t.productId, t.variantId],
      foreignColumns: [productVariant.productId, productVariant.id],
    }).onDelete("cascade"),
  ],
);

export {
  brand,
  category,
  product,
  productImage,
  productOption,
  productOptionValue,
  productStatus,
  productVariant,
  productVariantOptionValue,
};
