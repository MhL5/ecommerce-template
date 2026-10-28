import { discountCodes } from "@/features/checkout/api/data/discount-codes";
import type { DiscountCode } from "@/features/checkout/types";
import { createLocalStore } from "@/lib/createLocalStore";
import { z } from "zod";

/**
 * The full list of codes once the admin has changed anything; `null` means
 * "still the mock codes".
 */
const discountStore = createLocalStore<{ codes: DiscountCode[] | null }>(
  "northstar:discounts",
  { codes: null },
  z.object({
    codes: z
      .array(
        z.object({
          id: z.string(),
          code: z.string(),
          kind: z.enum(["percent", "fixed", "free-shipping"]),
          value: z.number(),
          minSubtotal: z.number().optional(),
          description: z.string(),
          startsAt: z.string().nullable(),
          endsAt: z.string().nullable(),
          usageLimit: z.number().nullable(),
          isActive: z.boolean(),
          createdAt: z.string(),
        }),
      )
      .nullable(),
  }),
);

function getDiscountCodes() {
  return discountStore.getState().codes ?? discountCodes;
}

function useDiscountCodes() {
  return discountStore.useStore().codes ?? discountCodes;
}

function useDiscountCodesModified() {
  return discountStore.useStore().codes !== null;
}

type DiscountCodeInput = Omit<DiscountCode, "id" | "createdAt">;

/**
 * Adds a code, or updates it when `id` is given. Codes are stored upper-case
 * and must be unique.
 */
function saveDiscountCode(
  input: DiscountCodeInput,
  id?: string,
): { ok: true; code: DiscountCode } | { ok: false; error: string } {
  const codes = getDiscountCodes();
  const code = input.code.trim().toUpperCase();
  if (codes.some((entry) => entry.code === code && entry.id !== id)) {
    return { ok: false, error: `${code} already exists` };
  }

  const existing = id ? codes.find((entry) => entry.id === id) : undefined;
  const saved: DiscountCode = {
    ...input,
    code,
    id: existing?.id ?? crypto.randomUUID(),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
  discountStore.setState({
    codes: existing
      ? codes.map((entry) => (entry.id === id ? saved : entry))
      : [saved, ...codes],
  });
  return { ok: true, code: saved };
}

function setDiscountActive(id: string, isActive: boolean) {
  discountStore.setState({
    codes: getDiscountCodes().map((entry) =>
      entry.id === id ? { ...entry, isActive } : entry,
    ),
  });
}

function deleteDiscountCode(id: string) {
  discountStore.setState({
    codes: getDiscountCodes().filter((entry) => entry.id !== id),
  });
}

function resetDiscountCodes() {
  discountStore.setState({ codes: null });
}

export {
  deleteDiscountCode,
  getDiscountCodes,
  resetDiscountCodes,
  saveDiscountCode,
  setDiscountActive,
  useDiscountCodes,
  useDiscountCodesModified,
  type DiscountCodeInput,
};
