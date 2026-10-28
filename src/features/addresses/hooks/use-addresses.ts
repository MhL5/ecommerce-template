import { addressStore } from "@/features/addresses/api/address-store";
import type { SavedAddress } from "@/features/addresses/types";
import { useHydrated } from "@/hooks/use-hydrated";

/** A user's saved addresses, default first, then oldest first. */
function useAddresses(userId: string | undefined) {
  const { addresses } = addressStore.useStore();
  const hydrated = useHydrated();

  const mine: SavedAddress[] = userId
    ? addresses
        .filter((entry) => entry.userId === userId)
        .sort(
          (a, b) =>
            Number(b.isDefault) - Number(a.isDefault) ||
            a.createdAt.localeCompare(b.createdAt),
        )
    : [];

  return { addresses: mine, hydrated };
}

export { useAddresses };
