import type { AddressInput, SavedAddress } from "@/features/addresses/types";
import { createLocalStore } from "@/lib/createLocalStore";
import { z } from "zod";

const addressStore = createLocalStore<{ addresses: SavedAddress[] }>(
  "northstar:addresses",
  { addresses: [] },
  z.object({
    addresses: z.array(
      z.object({
        id: z.string(),
        userId: z.string(),
        label: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        address1: z.string(),
        address2: z.string(),
        city: z.string(),
        region: z.string(),
        postalCode: z.string(),
        country: z.string(),
        phone: z.string(),
        isDefault: z.boolean(),
        createdAt: z.string(),
      }),
    ),
  }),
);

/**
 * Adds an address, or updates it when `id` is given. A user's first address
 * becomes their default. Returns the saved address.
 */
function saveAddress(userId: string, input: AddressInput, id?: string) {
  const existing = id
    ? addressStore.getState().addresses.find((entry) => entry.id === id)
    : undefined;
  const hasAny = addressStore
    .getState()
    .addresses.some((entry) => entry.userId === userId);

  const address: SavedAddress = existing
    ? { ...existing, ...input }
    : {
        ...input,
        id: crypto.randomUUID(),
        userId,
        isDefault: !hasAny,
        createdAt: new Date().toISOString(),
      };

  addressStore.setState((state) => ({
    addresses: existing
      ? state.addresses.map((entry) => (entry.id === id ? address : entry))
      : [...state.addresses, address],
  }));
  return address;
}

/** Removes an address; if it was the default, the oldest remaining one takes over. */
function deleteAddress(id: string) {
  addressStore.setState((state) => {
    const removed = state.addresses.find((entry) => entry.id === id);
    const addresses = state.addresses.filter((entry) => entry.id !== id);
    if (!removed?.isDefault) return { addresses };

    const heir = addresses.find((entry) => entry.userId === removed.userId);
    return {
      addresses: addresses.map((entry) =>
        entry === heir ? { ...entry, isDefault: true } : entry,
      ),
    };
  });
}

function setDefaultAddress(userId: string, id: string) {
  addressStore.setState((state) => ({
    addresses: state.addresses.map((entry) =>
      entry.userId === userId
        ? { ...entry, isDefault: entry.id === id }
        : entry,
    ),
  }));
}

export { addressStore, deleteAddress, saveAddress, setDefaultAddress };
