import type { Discount } from "@/features/cart/utils/totals";

/** A promo code as the admin manages it (mirrors the `discount` table). */
type DiscountCode = Discount & {
  id: string;
  /** ISO date; the code works from the start of this day. */
  startsAt: string | null;
  /** ISO date; the code works until the end of this day. */
  endsAt: string | null;
  /** Total redemptions allowed across all customers. */
  usageLimit: number | null;
  isActive: boolean;
  createdAt: string;
};

type DiscountKind = Discount["kind"];

/** Where a code stands right now, for the admin table. */
type DiscountStatus =
  "active" | "scheduled" | "expired" | "used-up" | "disabled";

export type { DiscountCode, DiscountKind, DiscountStatus };
