import {
  type InferInsertModel,
  count,
  getTableName,
  is,
  sql,
} from "drizzle-orm";
import {
  type PgAsyncDatabase,
  type PgQueryResultHKT,
  PgTable,
} from "drizzle-orm/pg-core";

import * as schema from "../schema";
import { buildSeed } from "./data";

// Any async Postgres driver (node-postgres in the CLI, PGlite in tests).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Database = PgAsyncDatabase<PgQueryResultHKT, any>;

/**
 * Inserts the mock catalogue, users and order history in one transaction.
 *
 * With `reset`, every table in the schema is truncated first (including
 * sessions, carts and wishlists). Without it, the seed refuses to run on a
 * database that already has products, so it never mixes with real data.
 */
async function seedDatabase(db: Database, { reset = false } = {}) {
  const data = buildSeed();

  await db.transaction(async (tx) => {
    if (reset) {
      const tables = Object.values(schema)
        .filter((value) => is(value, PgTable))
        .map((table) => `"${getTableName(table)}"`);
      await tx.execute(sql.raw(`truncate table ${tables.join(", ")} cascade`));
    } else {
      const [existing] = await tx.select({ n: count() }).from(schema.product);
      if (existing && existing.n > 0)
        throw new Error(
          `The database already has ${existing.n} products. Run with --reset to wipe it and seed again.`,
        );
    }

    const insert = async <T extends PgTable>(
      table: T,
      rows: InferInsertModel<T>[],
    ) => {
      // Stay well under Postgres' 65k bind-parameter limit. The cast is only
      // because drizzle can't resolve `values()` for a generic table.
      for (let i = 0; i < rows.length; i += 500)
        await tx.insert(table).values(rows.slice(i, i + 500) as never);
    };

    await insert(schema.user, data.userRows);
    await insert(schema.category, data.categoryRows);
    await insert(schema.brand, data.brandRows);
    await insert(schema.product, data.productRows);
    await insert(schema.productOption, data.optionRows);
    await insert(schema.productOptionValue, data.optionValueRows);
    await insert(schema.productVariant, data.variantRows);
    await insert(schema.productVariantOptionValue, data.variantOptionRows);
    await insert(schema.productImage, data.imageRows);
    await insert(schema.attribute, data.attributeRows);
    await insert(schema.categoryAttribute, data.categoryAttributeRows);
    await insert(schema.productAttributeValue, data.valueRows);
    await insert(schema.review, data.reviewRows);
    await insert(schema.address, data.addressRows);
    await insert(schema.discount, data.discountRows);
    await insert(schema.shippingMethod, data.shippingRows);
    await insert(schema.order, data.orderRows);
    await insert(schema.orderItem, data.itemRows);
    await insert(schema.orderStatusEvent, data.eventRows);
    await insert(schema.payment, data.paymentRows);
    await insert(schema.discountRedemption, data.redemptionRows);
  });

  return summarize(data);
}

function summarize(data: ReturnType<typeof buildSeed>) {
  return {
    users: data.userRows.length,
    categories: data.categoryRows.length,
    brands: data.brandRows.length,
    products: data.productRows.length,
    variants: data.variantRows.length,
    images: data.imageRows.length,
    attributes: data.attributeRows.length,
    reviews: data.reviewRows.length,
    discounts: data.discountRows.length,
    shippingMethods: data.shippingRows.length,
    orders: data.orderRows.length,
    orderItems: data.itemRows.length,
  };
}

export { seedDatabase };
