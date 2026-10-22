import type { Discount } from "@/features/cart/utils/totals";
import { discountCodes } from "@/features/checkout/api/data/discount-codes";
import { formatPrice } from "@/lib/format";

type DiscountLookup =
  { ok: true; discount: Discount } | { ok: false; error: string };

/** Validates a code against the current subtotal (cents). */
function lookupDiscount(rawCode: string, subtotal: number): DiscountLookup {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, error: "Enter a code" };

  const discount = discountCodes.find((entry) => entry.code === code);
  if (!discount) return { ok: false, error: "That code isn’t valid" };

  if (discount.minSubtotal && subtotal < discount.minSubtotal) {
    return {
      ok: false,
      error: `${code} needs a subtotal of ${formatPrice(discount.minSubtotal)}`,
    };
  }
  return { ok: true, discount };
}

export { lookupDiscount, type DiscountLookup };
