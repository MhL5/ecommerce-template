import type { OrderAddress } from "@/features/orders/types";

/** An address saved to a user's account (mirrors the `address` table). */
type SavedAddress = OrderAddress & {
  id: string;
  userId: string;
  /** Optional nickname, e.g. "Home" or "Work". */
  label: string;
  /** Pre-selected at checkout. Each user has at most one. */
  isDefault: boolean;
  createdAt: string;
};

/** What the address form edits. */
type AddressInput = Omit<
  SavedAddress,
  "id" | "userId" | "isDefault" | "createdAt"
>;

export type { AddressInput, SavedAddress };
