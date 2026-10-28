/**
 * Turns the mock data in `src/features/*\/api/data` into database rows.
 *
 * Pure and deterministic: no database access, and ids come from `seedId`, so
 * the same rows are produced on every run. `index.ts` inserts them.
 */
import type {
  OrderAddress as DbOrderAddress,
  OrderItemOption,
} from "@/db/schema";
import { demoShoppers, seedUsers } from "@/features/auth/api/data/users";
import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_METHODS,
} from "@/features/cart/utils/totals";
import { discountCodes } from "@/features/checkout/api/data/discount-codes";
import { seedOrders } from "@/features/orders/api/data/seed-orders";
import type { OrderAddress, OrderStatus } from "@/features/orders/types";
import { categories } from "@/features/products/api/data/categories";
import { products } from "@/features/products/api/data/products";
import { buildReviews } from "@/features/products/api/data/reviews";
import type { Product } from "@/features/products/types";

import type * as schema from "../schema";
import { seedId, slugify } from "./ids";

type Insert<T extends { $inferInsert: unknown }> = T["$inferInsert"];

const productId = (id: string) => seedId(`product:${id}`);
const variantId = (id: string) => seedId(`variant:${id}`);

/** The variant an order line without a `variantId` points at. */
function defaultVariantId(product: Product) {
  return variantId(product.variants?.[0]?.id ?? `${product.id}:default`);
}

function buildCatalog() {
  const categoryRows: Insert<typeof schema.category>[] = categories.map(
    (category, position) => ({
      id: seedId(`category:${category.id}`),
      slug: category.id,
      name: category.name,
      description: category.description,
      image: category.image,
      position,
    }),
  );

  const brandNames = [...new Set(products.map((p) => p.brand))].sort();
  const brandRows: Insert<typeof schema.brand>[] = brandNames.map((name) => ({
    id: seedId(`brand:${slugify(name)}`),
    slug: slugify(name),
    name,
  }));

  const productRows: Insert<typeof schema.product>[] = [];
  const imageRows: Insert<typeof schema.productImage>[] = [];
  const optionRows: Insert<typeof schema.productOption>[] = [];
  const optionValueRows: Insert<typeof schema.productOptionValue>[] = [];
  const variantRows: Insert<typeof schema.productVariant>[] = [];
  const variantOptionRows: Insert<typeof schema.productVariantOptionValue>[] =
    [];

  for (const p of products) {
    const id = productId(p.id);
    const createdAt = new Date(p.createdAt);

    productRows.push({
      id,
      slug: p.slug,
      name: p.name,
      brandId: seedId(`brand:${slugify(p.brand)}`),
      categoryId: seedId(`category:${p.categoryId}`),
      description: p.description,
      highlights: p.highlights,
      tags: p.tags,
      status: "active",
      featured: p.featured,
      // Kept from the mock data so listings look the same as the mock UI;
      // recompute from `review` once real reviews come in.
      ratingAverage: p.rating,
      reviewCount: p.reviewCount,
      publishedAt: createdAt,
      createdAt,
      updatedAt: createdAt,
    });

    p.images.forEach((url, position) =>
      imageRows.push({
        id: seedId(`image:${p.id}:${position}`),
        productId: id,
        url,
        alt: position === 0 ? p.name : `${p.name}, view ${position + 1}`,
        position,
      }),
    );

    if (!p.options?.length || !p.variants?.length) {
      variantRows.push({
        id: defaultVariantId(p),
        productId: id,
        sku: `NS-${p.id.toUpperCase()}`,
        title: "",
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        stock: p.stock,
        isDefault: true,
        createdAt,
        updatedAt: createdAt,
      });
      continue;
    }

    // value ids by option index, then value
    const valueIds = p.options.map((option, position) => {
      const optionId = seedId(`option:${p.id}:${option.name}`);
      optionRows.push({
        id: optionId,
        productId: id,
        name: option.name,
        position,
      });
      return {
        optionId,
        values: new Map(
          option.values.map((value, valuePosition) => {
            const valueId = seedId(
              `option-value:${p.id}:${option.name}:${value.value}`,
            );
            optionValueRows.push({
              id: valueId,
              optionId,
              value: value.value,
              swatch: value.swatch ?? null,
              position: valuePosition,
            });
            return [value.value, valueId];
          }),
        ),
      };
    });

    p.variants.forEach((variant, position) => {
      const rowId = variantId(variant.id);
      variantRows.push({
        id: rowId,
        productId: id,
        sku: variant.sku,
        title: variant.title,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        stock: variant.stock,
        isDefault: position === 0,
        position,
        createdAt,
        updatedAt: createdAt,
      });
      variant.values.forEach((value, optionIndex) => {
        const option = valueIds[optionIndex]!;
        variantOptionRows.push({
          variantId: rowId,
          optionId: option.optionId,
          optionValueId: option.values.get(value)!,
        });
      });
    });
  }

  return {
    categoryRows,
    brandRows,
    productRows,
    imageRows,
    optionRows,
    optionValueRows,
    variantRows,
    variantOptionRows,
  };
}

/** Free-form `specs` become text attributes ("Battery life", "Weight", …). */
function buildAttributes() {
  const labels = [
    ...new Set(products.flatMap((p) => p.specs.map((s) => s.label))),
  ];
  const attributeRows: Insert<typeof schema.attribute>[] = labels.map(
    (name, position) => ({
      id: seedId(`attribute:${slugify(name)}`),
      slug: slugify(name),
      name,
      type: "text",
      position,
    }),
  );

  const valueRows: Insert<typeof schema.productAttributeValue>[] = [];
  const categoryLinks = new Map<
    string,
    Insert<typeof schema.categoryAttribute>
  >();

  for (const p of products) {
    const seen = new Set<string>();
    p.specs.forEach((spec, position) => {
      const slug = slugify(spec.label);
      if (seen.has(slug)) return;
      seen.add(slug);
      const attributeId = seedId(`attribute:${slug}`);
      valueRows.push({
        id: seedId(`attribute-value:${p.id}:${slug}`),
        productId: productId(p.id),
        attributeId,
        valueText: spec.value,
        position,
      });
      const key = `${p.categoryId}:${slug}`;
      if (!categoryLinks.has(key))
        categoryLinks.set(key, {
          categoryId: seedId(`category:${p.categoryId}`),
          attributeId,
          position: categoryLinks.size,
        });
    });
  }

  return {
    attributeRows,
    valueRows,
    categoryAttributeRows: [...categoryLinks.values()],
  };
}

function buildReviewRows(): Insert<typeof schema.review>[] {
  return products.flatMap((p: Product) =>
    buildReviews(p).map((review) => {
      const date = new Date(review.date);
      return {
        id: seedId(`review:${p.id}:${review.id}`),
        productId: productId(p.id),
        authorName: review.author,
        rating: review.rating,
        title: review.title,
        body: review.body,
        status: "published" as const,
        createdAt: date,
        updatedAt: date,
      };
    }),
  );
}

function buildCheckoutConfig() {
  const discountRows: Insert<typeof schema.discount>[] = discountCodes.map(
    (code) => ({
      id: seedId(`discount:${code.code}`),
      code: code.code,
      description: code.description,
      kind: code.kind === "free-shipping" ? "free_shipping" : code.kind,
      value: code.value,
      minSubtotal: code.minSubtotal ?? null,
      startsAt: code.startsAt ? new Date(code.startsAt) : null,
      endsAt: code.endsAt ? new Date(code.endsAt) : null,
      usageLimit: code.usageLimit,
      isActive: code.isActive,
    }),
  );

  const shippingRows: Insert<typeof schema.shippingMethod>[] =
    SHIPPING_METHODS.map((method, position) => ({
      id: seedId(`shipping:${method.id}`),
      code: method.id,
      name: method.label,
      description: method.description,
      price: method.price,
      freeOverSubtotal:
        method.id === "standard" ? FREE_SHIPPING_THRESHOLD : null,
      minDeliveryDays: method.id === "standard" ? 3 : 1,
      maxDeliveryDays: method.id === "standard" ? 5 : 2,
      position,
    }));

  return { discountRows, shippingRows };
}

/**
 * Users only. Better Auth owns passwords (`account.password`), so nobody can
 * sign in as these users until Better Auth is added and they register or get
 * a credential account.
 */
function buildUsers(): Insert<typeof schema.user>[] {
  return seedUsers.map((user) => {
    const createdAt = new Date(user.createdAt);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: true,
      role: user.role,
      createdAt,
      updatedAt: createdAt,
    };
  });
}

function buildAddresses(): Insert<typeof schema.address>[] {
  return demoShoppers.map((shopper) => {
    const [firstName = "", ...rest] = shopper.name.split(" ");
    return {
      id: seedId(`address:${shopper.id}`),
      userId: shopper.id,
      label: "Home",
      firstName,
      lastName: rest.join(" "),
      address1: "1 Main Street",
      city: shopper.city,
      region: shopper.region,
      postalCode: shopper.postalCode,
      country: shopper.country,
      isDefaultShipping: true,
      isDefaultBilling: true,
    };
  });
}

function toDbAddress(address: OrderAddress): DbOrderAddress {
  return {
    firstName: address.firstName,
    lastName: address.lastName,
    address1: address.address1,
    ...(address.address2 ? { address2: address.address2 } : {}),
    city: address.city,
    region: address.region,
    postalCode: address.postalCode,
    country: address.country,
    ...(address.phone ? { phone: address.phone } : {}),
  };
}

const HOUR = 3_600_000;

/** Timeline that leads to the order's current status. */
function statusTimeline(status: OrderStatus, placed: Date) {
  const at = (hours: number) => new Date(placed.getTime() + hours * HOUR);
  const events: { status: OrderStatus; createdAt: Date; note?: string }[] = [
    { status: "processing", createdAt: placed, note: "Order placed" },
  ];
  if (status === "cancelled")
    events.push({ status, createdAt: at(3), note: "Cancelled and restocked" });
  if (status === "shipped" || status === "delivered")
    events.push({ status: "shipped", createdAt: at(26) });
  if (status === "delivered")
    events.push({ status: "delivered", createdAt: at(26 + 72) });
  return events;
}

function buildOrders(
  variantRows: Insert<typeof schema.productVariant>[],
  optionRows: Insert<typeof schema.productOption>[],
  optionValueRows: Insert<typeof schema.productOptionValue>[],
  variantOptionRows: Insert<typeof schema.productVariantOptionValue>[],
) {
  const variants = new Map(variantRows.map((v) => [v.id!, v]));
  const optionNames = new Map(optionRows.map((o) => [o.id!, o.name]));
  const optionValues = new Map(optionValueRows.map((v) => [v.id!, v.value]));
  const methodLabel = new Map(SHIPPING_METHODS.map((m) => [m.id, m.label]));

  const orderRows: Insert<typeof schema.order>[] = [];
  const itemRows: Insert<typeof schema.orderItem>[] = [];
  const eventRows: Insert<typeof schema.orderStatusEvent>[] = [];
  const paymentRows: Insert<typeof schema.payment>[] = [];
  const redemptionRows: Insert<typeof schema.discountRedemption>[] = [];

  for (const order of seedOrders) {
    const id = seedId(`order:${order.id}`);
    const placed = new Date(order.createdAt);
    const timeline = statusTimeline(order.status, placed);
    const updatedAt = timeline.at(-1)!.createdAt;
    const discountId = order.discountCode
      ? seedId(`discount:${order.discountCode}`)
      : null;

    orderRows.push({
      id,
      number: order.number,
      userId: order.userId,
      email: order.email,
      status: order.status,
      paymentStatus: order.status === "cancelled" ? "refunded" : "paid",
      subtotal: order.totals.subtotal,
      discountTotal: order.totals.discount,
      shippingTotal: order.totals.shipping,
      taxTotal: order.totals.tax,
      total: order.totals.total,
      discountId,
      discountCode: order.discountCode ?? null,
      shippingMethodId: seedId(`shipping:${order.shippingMethod}`),
      shippingMethodName: methodLabel.get(order.shippingMethod) ?? "Standard",
      shippingAddress: toDbAddress(order.shippingAddress),
      cancelledAt: order.status === "cancelled" ? updatedAt : null,
      createdAt: placed,
      updatedAt,
    });

    order.items.forEach((line, index) => {
      const product = products.find((p) => p.id === line.productId);
      const lineVariantId = line.variantId
        ? variantId(line.variantId)
        : product
          ? defaultVariantId(product)
          : null;
      const variant = lineVariantId ? variants.get(lineVariantId) : undefined;
      const options: OrderItemOption[] = variantOptionRows
        .filter((row) => row.variantId === lineVariantId)
        .map((row) => ({
          name: optionNames.get(row.optionId) ?? "",
          value: optionValues.get(row.optionValueId) ?? "",
        }));
      itemRows.push({
        id: seedId(`order-item:${order.id}:${index}`),
        orderId: id,
        productId: productId(line.productId),
        variantId: lineVariantId,
        productName: line.name,
        productSlug: line.slug,
        brandName: line.brand,
        variantTitle: variant?.title ?? "",
        options,
        sku: variant?.sku ?? null,
        image: line.image,
        unitPrice: line.price,
        quantity: line.quantity,
        lineTotal: line.price * line.quantity,
        createdAt: placed,
      });
    });

    timeline.forEach((event, index) =>
      eventRows.push({
        id: seedId(`order-event:${order.id}:${index}`),
        orderId: id,
        status: event.status,
        note: event.note ?? null,
        createdAt: event.createdAt,
      }),
    );

    paymentRows.push({
      id: seedId(`payment:${order.id}`),
      orderId: id,
      provider: "mock",
      providerReference: `mock_${order.number}`,
      status: order.status === "cancelled" ? "refunded" : "paid",
      amount: order.totals.total,
      refundedAmount: order.status === "cancelled" ? order.totals.total : 0,
      cardBrand: order.payment.brand,
      cardLast4: order.payment.last4,
      createdAt: placed,
      updatedAt,
    });

    if (discountId)
      redemptionRows.push({
        id: seedId(`redemption:${order.id}`),
        discountId,
        orderId: id,
        userId: order.userId,
        email: order.email,
        amount: order.totals.discount,
        createdAt: placed,
      });
  }

  return { orderRows, itemRows, eventRows, paymentRows, redemptionRows };
}

function buildSeed() {
  const catalog = buildCatalog();
  const attributes = buildAttributes();
  const checkout = buildCheckoutConfig();
  const orders = buildOrders(
    catalog.variantRows,
    catalog.optionRows,
    catalog.optionValueRows,
    catalog.variantOptionRows,
  );

  // Cached redemption counts on each code.
  for (const row of checkout.discountRows)
    row.usedCount = orders.redemptionRows.filter(
      (r) => r.discountId === row.id,
    ).length;

  return {
    ...catalog,
    ...attributes,
    ...checkout,
    reviewRows: buildReviewRows(),
    userRows: buildUsers(),
    addressRows: buildAddresses(),
    ...orders,
  };
}

type SeedData = ReturnType<typeof buildSeed>;

export { buildSeed, type SeedData };
