import { demoShoppers, shopperEmail } from "@/features/auth/api/data/users";
import {
  type Discount,
  computeOrderTotals,
} from "@/features/cart/utils/totals";
import { discountCodes } from "@/features/checkout/api/data/discount-codes";
import type {
  Order,
  OrderAddress,
  OrderItem,
  OrderStatus,
} from "@/features/orders/types";
import { seedStatusHistory } from "@/features/orders/utils/timeline";
import { getProductById, getProducts } from "@/features/products/api";

/** Builds an order item snapshot from the catalogue. */
function item(productId: string, quantity: number): OrderItem {
  const product = getProductById(productId);
  if (!product)
    throw new Error(`Seed order references unknown product ${productId}`);
  return {
    productId,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    image: product.images[0] ?? "",
    price: product.price,
    quantity,
  };
}

type SeedOrderInput = Omit<Order, "totals" | "discountCode"> & {
  discount?: Discount;
};

function seedOrder({ discount, ...order }: SeedOrderInput): Order {
  const subtotal = order.items.reduce(
    (sum, line) => sum + line.price * line.quantity,
    0,
  );
  // Only keep a code the order actually qualifies for (e.g. SAVE20's minimum).
  const applied =
    discount && subtotal >= (discount.minSubtotal ?? 0) ? discount : null;
  return {
    ...order,
    totals: computeOrderTotals(subtotal, order.shippingMethod, applied),
    ...(applied ? { discountCode: applied.code } : {}),
    statusHistory: seedStatusHistory(order.status, order.createdAt),
  };
}

const demoCustomerAddress: OrderAddress = {
  firstName: "Alex",
  lastName: "Morgan",
  address1: "221 Harbour Street",
  address2: "Apt 4B",
  city: "Portland",
  region: "OR",
  postalCode: "97209",
  country: "US",
  phone: "",
};

/** Past orders for the demo customer, shown on their account pages. */
const demoCustomerOrders: Order[] = [
  seedOrder({
    id: "seed-order-2",
    number: "NS-K7Q2MD",
    createdAt: "2026-10-12T15:24:00.000Z",
    status: "shipped",
    userId: "u-demo",
    email: "demo@northstar.test",
    shippingAddress: demoCustomerAddress,
    items: [item("p09", 1), item("p21", 2)],
    shippingMethod: "standard",
    payment: { brand: "Visa", last4: "4242" },
  }),
  seedOrder({
    id: "seed-order-1",
    number: "NS-3HX8TB",
    createdAt: "2026-08-03T09:12:00.000Z",
    status: "delivered",
    userId: "u-demo",
    email: "demo@northstar.test",
    shippingAddress: demoCustomerAddress,
    items: [item("p13", 1), item("p16", 1), item("p25", 1)],
    shippingMethod: "express",
    payment: { brand: "Mastercard", last4: "4444" },
  }),
];

/** Small seeded PRNG (mulberry32) so the generated history never changes. */
function random(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fixed "today" for the generated history (keeps prerendering static). */
const HISTORY_END = Date.UTC(2026, 9, 21, 18, 0);
const DAY = 86_400_000;
const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * ~40 orders over the 90 days before HISTORY_END from the demo shoppers and
 * a few guests, so the admin dashboard, orders and customers pages have data.
 */
function generateHistory(): Order[] {
  const next = random(20261021);
  const pick = <T>(list: readonly T[]) =>
    list[Math.floor(next() * list.length)]!;
  const products = getProducts();
  const guests = ["river.b", "casey.m", "taylor.q"];
  const streets = ["Oak Lane", "Market Street", "Harbour Road", "Elm Avenue"];
  const orders: Order[] = [];

  for (let index = 0; index < 40; index++) {
    // Weight towards recent days so the chart trends upwards.
    const daysAgo = Math.floor(Math.pow(next(), 1.4) * 90);
    const createdAt = new Date(
      HISTORY_END - daysAgo * DAY - Math.floor(next() * 10) * 3_600_000,
    );

    const isGuest = next() < 0.15;
    const shopper = pick(demoShoppers);
    const guest = pick(guests);
    const [firstName = "", ...rest] = isGuest
      ? [guest.split(".")[0]!.replace(/^./, (c) => c.toUpperCase()), "Guest"]
      : shopper.name.split(" ");

    const lineCount = 1 + Math.floor(next() * 3);
    const chosen = new Set<string>();
    while (chosen.size < lineCount) chosen.add(pick(products).id);
    const items = [...chosen].map((id) => item(id, next() < 0.75 ? 1 : 2));

    let status: OrderStatus =
      daysAgo <= 1 ? "processing" : daysAgo <= 6 ? "shipped" : "delivered";
    if (next() < 0.08) status = "cancelled";

    const reference = Array.from(
      { length: 6 },
      () => REFERENCE_ALPHABET[Math.floor(next() * REFERENCE_ALPHABET.length)],
    ).join("");

    orders.push(
      seedOrder({
        id: `seed-history-${index + 1}`,
        number: `NS-${reference}`,
        createdAt: createdAt.toISOString(),
        status,
        userId: isGuest ? null : shopper.id,
        email: isGuest ? `${guest}@example.test` : shopperEmail(shopper.name),
        shippingAddress: {
          firstName,
          lastName: rest.join(" "),
          address1: `${10 + Math.floor(next() * 380)} ${pick(streets)}`,
          address2: "",
          city: isGuest ? "Chicago" : shopper.city,
          region: isGuest ? "IL" : shopper.region,
          postalCode: isGuest ? "60601" : shopper.postalCode,
          country: isGuest ? "US" : shopper.country,
          phone: "",
        },
        items,
        shippingMethod: next() < 0.2 ? "express" : "standard",
        payment:
          next() < 0.6
            ? { brand: "Visa", last4: "4242" }
            : { brand: "Mastercard", last4: "4444" },
        ...(next() < 0.2 ? { discount: pick(discountCodes) } : {}),
      }),
    );
  }

  return orders;
}

/**
 * Static order history, merged with the orders placed in this browser.
 * Seeded orders are never written to localStorage.
 */
const seedOrders: Order[] = [...demoCustomerOrders, ...generateHistory()];

export { seedOrders };
