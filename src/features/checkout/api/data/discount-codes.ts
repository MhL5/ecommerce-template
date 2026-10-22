import type { Discount } from "@/features/cart/utils/totals";

/** Mock promo codes accepted at checkout (case-insensitive). */
const discountCodes: Discount[] = [
  {
    code: "WELCOME10",
    kind: "percent",
    value: 10,
    description: "10% off your order",
  },
  {
    code: "FREESHIP",
    kind: "free-shipping",
    value: 0,
    description: "Free shipping on any delivery speed",
  },
  {
    code: "SAVE20",
    kind: "fixed",
    value: 2000,
    minSubtotal: 10000,
    description: "$20 off orders of $100 or more",
  },
];

export { discountCodes };
