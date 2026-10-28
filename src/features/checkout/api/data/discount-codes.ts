import type { DiscountCode } from "@/features/checkout/types";

/** Mock promo codes accepted at checkout (case-insensitive). */
const discountCodes: DiscountCode[] = [
  {
    id: "discount-welcome10",
    code: "WELCOME10",
    kind: "percent",
    value: 10,
    description: "10% off your order",
    startsAt: null,
    endsAt: null,
    usageLimit: null,
    isActive: true,
    createdAt: "2026-07-01T09:00:00.000Z",
  },
  {
    id: "discount-freeship",
    code: "FREESHIP",
    kind: "free-shipping",
    value: 0,
    description: "Free shipping on any delivery speed",
    startsAt: null,
    endsAt: null,
    usageLimit: null,
    isActive: true,
    createdAt: "2026-07-01T09:00:00.000Z",
  },
  {
    id: "discount-save20",
    code: "SAVE20",
    kind: "fixed",
    value: 2000,
    minSubtotal: 10000,
    description: "$20 off orders of $100 or more",
    startsAt: null,
    endsAt: null,
    usageLimit: 500,
    isActive: true,
    createdAt: "2026-07-15T09:00:00.000Z",
  },
];

export { discountCodes };
