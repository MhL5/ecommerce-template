import type { CartItem } from "@/features/cart/types";
import {
  type Discount,
  type ShippingMethodId,
  computeOrderTotals,
} from "@/features/cart/utils/totals";
import type {
  Order,
  OrderAddress,
  OrderStatus,
  OrderStatusEvent,
} from "@/features/orders/types";
import { adjustStock } from "@/features/products/api/catalog-store";
import { createLocalStore } from "@/lib/createLocalStore";
import { z } from "zod";

const orderSchema = z.object({
  id: z.string(),
  number: z.string(),
  createdAt: z.string(),
  status: z.enum(["processing", "shipped", "delivered", "cancelled"]),
  userId: z.string().nullable(),
  email: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string().optional(),
      variantTitle: z.string().optional(),
      slug: z.string(),
      name: z.string(),
      brand: z.string(),
      image: z.string(),
      price: z.number(),
      quantity: z.number(),
    }),
  ),
  shippingAddress: z.object({
    firstName: z.string(),
    lastName: z.string(),
    address1: z.string(),
    address2: z.string(),
    city: z.string(),
    region: z.string(),
    postalCode: z.string(),
    country: z.string(),
    phone: z.string(),
  }),
  shippingMethod: z.enum(["standard", "express"]),
  totals: z.object({
    subtotal: z.number(),
    // Orders saved before discount codes existed have no discount field.
    discount: z.number().default(0),
    shipping: z.number(),
    tax: z.number(),
    total: z.number(),
  }),
  discountCode: z.string().optional(),
  payment: z.object({ brand: z.string(), last4: z.string() }),
});

type OrdersState = { orders: Order[] };

const orderStore = createLocalStore<OrdersState>(
  "northstar:orders",
  { orders: [] },
  z.object({ orders: z.array(orderSchema) }),
);

const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomReference(length: number) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(
    bytes,
    (byte) => REFERENCE_ALPHABET[byte % REFERENCE_ALPHABET.length],
  ).join("");
}

function cardBrand(cardNumber: string) {
  if (cardNumber.startsWith("4")) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(cardNumber)) return "Mastercard";
  if (/^3[47]/.test(cardNumber)) return "American Express";
  return "Card";
}

type CreateOrderInput = {
  items: CartItem[];
  email: string;
  userId: string | null;
  shippingAddress: OrderAddress;
  shippingMethod: ShippingMethodId;
  discount: Discount | null;
  /** Digits only; only the brand and last four are kept. */
  cardNumber: string;
};

/** Persists a new order (newest first) and returns it. */
function createOrder(input: CreateOrderInput): Order {
  const subtotal = input.items.reduce((sum, item) => sum + item.lineTotal, 0);
  const totals = computeOrderTotals(
    subtotal,
    input.shippingMethod,
    input.discount,
  );

  const order: Order = {
    id: crypto.randomUUID(),
    number: `NS-${randomReference(6)}`,
    createdAt: new Date().toISOString(),
    status: "processing",
    userId: input.userId,
    email: input.email,
    items: input.items.map(({ product, variant, quantity }) => ({
      productId: product.id,
      ...(variant
        ? { variantId: variant.id, variantTitle: variant.title }
        : {}),
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      image: product.images[0] ?? "",
      price: product.price,
      quantity,
    })),
    shippingAddress: input.shippingAddress,
    shippingMethod: input.shippingMethod,
    totals,
    ...(input.discount ? { discountCode: input.discount.code } : {}),
    payment: {
      brand: cardBrand(input.cardNumber),
      last4: input.cardNumber.slice(-4),
    },
  };

  orderStore.setState((state) => ({ orders: [order, ...state.orders] }));
  for (const item of order.items)
    adjustStock(item.productId, -item.quantity, item.variantId);
  return order;
}

/** Puts an order’s units back into stock (used when it’s cancelled). */
function restockOrder(order: Order) {
  for (const item of order.items)
    adjustStock(item.productId, item.quantity, item.variantId);
}

/**
 * Status changes by order id. Seed orders live in a TS file, so status edits
 * (from customers cancelling or the admin) are stored as overrides for every
 * order, and applied when orders are read.
 */
const statusStore = createLocalStore<
  Record<
    string,
    { status: OrderStatus; updatedAt: string; history: OrderStatusEvent[] }
  >
>(
  "northstar:order-status",
  {},
  z.record(
    z.string(),
    z.object({
      status: z.enum(["processing", "shipped", "delivered", "cancelled"]),
      updatedAt: z.string(),
      // Overrides saved before the timeline existed have no history.
      history: z
        .array(
          z.object({
            status: z.enum(["processing", "shipped", "delivered", "cancelled"]),
            at: z.string(),
          }),
        )
        .default([]),
    }),
  ),
);

/** Valid next steps from each status; cancelled and delivered are final. */
const STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

/**
 * Moves an order to `status` if the flow allows it. Cancelling puts the
 * items back in stock. Returns whether anything changed.
 */
function setOrderStatus(order: Order, status: OrderStatus) {
  if (!STATUS_FLOW[order.status].includes(status)) return false;
  const at = new Date().toISOString();
  statusStore.setState((current) => ({
    ...current,
    [order.id]: {
      status,
      updatedAt: at,
      history: [...(current[order.id]?.history ?? []), { status, at }],
    },
  }));
  if (status === "cancelled") restockOrder(order);
  return true;
}

function canCustomerCancel(order: Order) {
  return order.status === "processing";
}

export {
  canCustomerCancel,
  createOrder,
  orderStore,
  restockOrder,
  setOrderStatus,
  STATUS_FLOW,
  statusStore,
  type CreateOrderInput,
};
