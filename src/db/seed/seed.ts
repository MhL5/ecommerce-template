import contractJson from "@/prisma/contract.json" with { type: "json" };
import type { db as client } from "@/prisma/db";

import { buildSeed } from "./data";

type Database = typeof client;

/** Every table in the contract, quoted for `truncate`. */
const tableNames = Object.keys(
  contractJson.storage.namespaces.public.entries.table,
).map((name) => `"${name}"`);

/**
 * Inserts the mock catalogue, users and order history in one transaction.
 *
 * With `reset`, every table in the contract is truncated first (including
 * sessions, carts and wishlists). Without it, the seed refuses to run on a
 * database that already has products, so it never mixes with real data.
 */
async function seedDatabase(db: Database, { reset = false } = {}) {
  const data = buildSeed();

  await db.transaction(async (tx) => {
    if (reset) {
      // Table names come from the contract, not user input, so they are
      // spliced in as SQL text rather than bound as parameters.
      const statement = `truncate table ${tableNames.join(", ")} cascade`;
      const strings = Object.assign([statement], { raw: [statement] });
      await tx.execute(tx.raw.sql(strings).affectedCount().build());
    } else {
      const existing = await tx.orm.public.Product.aggregate((a) => ({
        n: a.count(),
      }));
      if (existing.n > 0)
        throw new Error(
          `The database already has ${existing.n} products. Run with --reset to wipe it and seed again.`,
        );
    }

    // Stay well under Postgres' 65k bind-parameter limit.
    const insert = async <Row>(
      create: (rows: Row[]) => Promise<number>,
      rows: Row[],
    ) => {
      for (let i = 0; i < rows.length; i += 500)
        await create(rows.slice(i, i + 500));
    };

    const orm = tx.orm.public;
    await insert((r) => orm.User.createAndCount(r), data.userRows);
    await insert((r) => orm.Category.createAndCount(r), data.categoryRows);
    await insert((r) => orm.Brand.createAndCount(r), data.brandRows);
    await insert((r) => orm.Product.createAndCount(r), data.productRows);
    await insert((r) => orm.ProductOption.createAndCount(r), data.optionRows);
    await insert(
      (r) => orm.ProductOptionValue.createAndCount(r),
      data.optionValueRows,
    );
    await insert((r) => orm.ProductVariant.createAndCount(r), data.variantRows);
    await insert(
      (r) => orm.ProductVariantOptionValue.createAndCount(r),
      data.variantOptionRows,
    );
    await insert((r) => orm.ProductImage.createAndCount(r), data.imageRows);
    await insert((r) => orm.Attribute.createAndCount(r), data.attributeRows);
    await insert(
      (r) => orm.CategoryAttribute.createAndCount(r),
      data.categoryAttributeRows,
    );
    await insert(
      (r) => orm.ProductAttributeValue.createAndCount(r),
      data.valueRows,
    );
    await insert((r) => orm.Review.createAndCount(r), data.reviewRows);
    await insert((r) => orm.Address.createAndCount(r), data.addressRows);
    await insert((r) => orm.Discount.createAndCount(r), data.discountRows);
    await insert(
      (r) => orm.ShippingMethod.createAndCount(r),
      data.shippingRows,
    );
    await insert((r) => orm.Order.createAndCount(r), data.orderRows);
    await insert((r) => orm.OrderItem.createAndCount(r), data.itemRows);
    await insert((r) => orm.OrderStatusEvent.createAndCount(r), data.eventRows);
    await insert((r) => orm.Payment.createAndCount(r), data.paymentRows);
    await insert(
      (r) => orm.DiscountRedemption.createAndCount(r),
      data.redemptionRows,
    );
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
