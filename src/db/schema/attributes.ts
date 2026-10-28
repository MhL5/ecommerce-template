/**
 * Attributes: descriptive facts about a product that don't create variants,
 * e.g. Material, Fabric weight, Wattage, Water resistance.
 *
 * An attribute is defined once (with a type and optional unit) and reused
 * across products, so the shop can filter on it ("Material: Wool") and the
 * admin can offer a consistent picker. Categories can suggest attributes.
 */
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { category, product, productVariant } from "./catalog";
import { id, timestamps } from "./columns";

/**
 * - `text`: free text ("Hand wash only")
 * - `number`: numeric value, shown with `unit` ("254" g)
 * - `boolean`: yes / no ("Waterproof")
 * - `select`: one of `attribute_option` ("Material: Wool")
 * - `multiselect`: several of `attribute_option` ("Features: GPS, NFC")
 */
const attributeType = pgEnum("attribute_type", [
  "text",
  "number",
  "boolean",
  "select",
  "multiselect",
]);

const attribute = pgTable("attribute", {
  id: id(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  type: attributeType("type").notNull().default("text"),
  /** Shown after number values, e.g. "g", "mAh", "cm". */
  unit: text("unit"),
  /** Show as a facet on product listings. */
  isFilterable: boolean("is_filterable").notNull().default(false),
  position: integer("position").notNull().default(0),
  ...timestamps,
});

/** Allowed values for `select` / `multiselect` attributes. */
const attributeOption = pgTable(
  "attribute_option",
  {
    id: id(),
    attributeId: uuid("attribute_id")
      .notNull()
      .references(() => attribute.id, { onDelete: "cascade" }),
    value: text("value").notNull(),
    position: integer("position").notNull().default(0),
  },
  (t) => [
    unique("attribute_option_attribute_value_uq").on(t.attributeId, t.value),
    // Target for the composite FK that keeps a value's option on its attribute.
    unique("attribute_option_attribute_id_uq").on(t.attributeId, t.id),
  ],
);

/** Attributes a category suggests (or requires) for its products. */
const categoryAttribute = pgTable(
  "category_attribute",
  {
    categoryId: uuid("category_id")
      .notNull()
      .references(() => category.id, { onDelete: "cascade" }),
    attributeId: uuid("attribute_id")
      .notNull()
      .references(() => attribute.id, { onDelete: "cascade" }),
    isRequired: boolean("is_required").notNull().default(false),
    position: integer("position").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.categoryId, t.attributeId] })],
);

/**
 * An attribute value on a product, or on one variant when `variantId` is set.
 * Exactly one `value*` / `optionId` column is filled, matching the attribute
 * type. `multiselect` attributes get one row per chosen option.
 */
const productAttributeValue = pgTable(
  "product_attribute_value",
  {
    id: id(),
    productId: uuid("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id"),
    attributeId: uuid("attribute_id")
      .notNull()
      .references(() => attribute.id, { onDelete: "cascade" }),
    valueText: text("value_text"),
    valueNumber: numeric("value_number", { mode: "number" }),
    valueBoolean: boolean("value_boolean"),
    optionId: uuid("option_id"),
    position: integer("position").notNull().default(0),
  },
  (t) => [
    index("product_attribute_value_product_id_idx").on(t.productId),
    // Facet filtering: "products with Material = Wool" / "Weight < 300".
    index("product_attribute_value_option_idx").on(t.attributeId, t.optionId),
    index("product_attribute_value_number_idx").on(
      t.attributeId,
      t.valueNumber,
    ),
    unique("product_attribute_value_uq")
      .on(t.productId, t.variantId, t.attributeId, t.optionId)
      .nullsNotDistinct(),
    foreignKey({
      name: "product_attribute_value_variant_fk",
      columns: [t.productId, t.variantId],
      foreignColumns: [productVariant.productId, productVariant.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "product_attribute_value_option_fk",
      columns: [t.attributeId, t.optionId],
      foreignColumns: [attributeOption.attributeId, attributeOption.id],
    }).onDelete("cascade"),
    check(
      "product_attribute_value_one_value_check",
      sql`num_nonnulls(${t.valueText}, ${t.valueNumber}, ${t.valueBoolean}, ${t.optionId}) = 1`,
    ),
  ],
);

export {
  attribute,
  attributeOption,
  attributeType,
  categoryAttribute,
  productAttributeValue,
};
