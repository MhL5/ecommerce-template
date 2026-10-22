/** Orders at or above this subtotal (cents) ship free with standard delivery. */
const FREE_SHIPPING_THRESHOLD = 7500;
/** Flat mock sales tax applied to the subtotal. */
const TAX_RATE = 0.08;

type ShippingMethodId = "standard" | "express";

type ShippingMethod = {
  id: ShippingMethodId;
  label: string;
  description: string;
  /** Cents. Standard becomes free above the threshold. */
  price: number;
};

const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "standard",
    label: "Standard",
    description: "3–5 business days",
    price: 695,
  },
  {
    id: "express",
    label: "Express",
    description: "1–2 business days",
    price: 1495,
  },
];

function getShippingMethod(id: ShippingMethodId) {
  return (
    SHIPPING_METHODS.find((method) => method.id === id) ?? SHIPPING_METHODS[0]!
  );
}

function getShippingCost(subtotal: number, methodId: ShippingMethodId) {
  if (subtotal === 0) return 0;
  const method = getShippingMethod(methodId);
  if (method.id === "standard" && subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return method.price;
}

/** A resolved discount code (see `checkout/api/data/discount-codes.ts`). */
type Discount = {
  code: string;
  kind: "percent" | "fixed" | "free-shipping";
  /** Percent (10 = 10%) or cents, depending on `kind`. */
  value: number;
  /** Subtotal in cents the order must reach for the code to apply. */
  minSubtotal?: number;
  description: string;
};

/** Cents taken off the subtotal (0 for free-shipping codes). */
function getDiscountAmount(subtotal: number, discount: Discount | null) {
  if (!discount || subtotal < (discount.minSubtotal ?? 0)) return 0;
  if (discount.kind === "percent") {
    return Math.round((subtotal * discount.value) / 100);
  }
  if (discount.kind === "fixed") return Math.min(subtotal, discount.value);
  return 0;
}

type CartTotals = {
  subtotal: number;
  /** Cents taken off by a discount code. */
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  /** Cents still needed for free standard shipping (0 once qualified). */
  freeShippingRemaining: number;
};

/** Tax is charged on the discounted subtotal; shipping is untaxed. */
function computeTotals(
  subtotal: number,
  methodId: ShippingMethodId = "standard",
  discountCode: Discount | null = null,
): CartTotals {
  const discount = getDiscountAmount(subtotal, discountCode);
  const freeShipping =
    discountCode?.kind === "free-shipping" &&
    subtotal >= (discountCode.minSubtotal ?? 0);
  const shipping = freeShipping ? 0 : getShippingCost(subtotal, methodId);
  const tax = Math.round((subtotal - discount) * TAX_RATE);

  return {
    subtotal,
    discount,
    shipping,
    tax,
    total: subtotal - discount + shipping + tax,
    freeShippingRemaining: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
  };
}

/** The persisted part of the totals (no free-shipping hint), for orders. */
function computeOrderTotals(
  subtotal: number,
  methodId: ShippingMethodId,
  discountCode: Discount | null = null,
) {
  const { discount, shipping, tax, total } = computeTotals(
    subtotal,
    methodId,
    discountCode,
  );
  return { subtotal, discount, shipping, tax, total };
}

export {
  computeOrderTotals,
  computeTotals,
  FREE_SHIPPING_THRESHOLD,
  getDiscountAmount,
  getShippingCost,
  getShippingMethod,
  SHIPPING_METHODS,
  TAX_RATE,
  type CartTotals,
  type Discount,
  type ShippingMethod,
  type ShippingMethodId,
};
