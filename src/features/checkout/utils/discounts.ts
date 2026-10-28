import type { Discount } from "@/features/cart/utils/totals";
import type { DiscountCode, DiscountStatus } from "@/features/checkout/types";
import type { Order } from "@/features/orders/types";
import { formatPrice } from "@/lib/format";

type DiscountLookup =
  { ok: true; discount: Discount } | { ok: false; error: string };

const DAY = 24 * 60 * 60 * 1000;

/** Dates are whole days: from the start of `startsAt` to the end of `endsAt`. */
function getDiscountStatus(
  code: DiscountCode,
  uses: number,
  now: number,
): DiscountStatus {
  if (!code.isActive) return "disabled";
  if (code.startsAt && now < Date.parse(code.startsAt)) return "scheduled";
  if (code.endsAt && now >= Date.parse(code.endsAt) + DAY) return "expired";
  if (code.usageLimit !== null && uses >= code.usageLimit) return "used-up";
  return "active";
}

/** Redemptions per code: orders that used it and weren't cancelled. */
function countDiscountUses(orders: Order[]) {
  const uses = new Map<string, number>();
  for (const order of orders) {
    if (!order.discountCode || order.status === "cancelled") continue;
    uses.set(order.discountCode, (uses.get(order.discountCode) ?? 0) + 1);
  }
  return uses;
}

const statusErrors: Record<Exclude<DiscountStatus, "active">, string> = {
  disabled: "That code isn’t valid",
  scheduled: "That code isn’t active yet",
  expired: "That code has expired",
  "used-up": "That code has been fully redeemed",
};

/** Validates a code against the current subtotal (cents). */
function lookupDiscount(
  rawCode: string,
  subtotal: number,
  codes: DiscountCode[],
  uses: Map<string, number>,
  now = Date.now(),
): DiscountLookup {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, error: "Enter a code" };

  const discount = codes.find((entry) => entry.code === code);
  if (!discount) return { ok: false, error: "That code isn’t valid" };

  const status = getDiscountStatus(discount, uses.get(code) ?? 0, now);
  if (status !== "active") return { ok: false, error: statusErrors[status] };

  if (discount.minSubtotal && subtotal < discount.minSubtotal) {
    return {
      ok: false,
      error: `${code} needs a subtotal of ${formatPrice(discount.minSubtotal)}`,
    };
  }
  return { ok: true, discount };
}

/** e.g. "10% off", "$20.00 off", "Free shipping". */
function describeDiscountValue(code: Discount) {
  if (code.kind === "percent") return `${code.value}% off`;
  if (code.kind === "fixed") return `${formatPrice(code.value)} off`;
  return "Free shipping";
}

export {
  countDiscountUses,
  describeDiscountValue,
  getDiscountStatus,
  lookupDiscount,
  type DiscountLookup,
};
