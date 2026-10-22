import { createLocalStore } from "@/lib/createLocalStore";
import { z } from "zod";

/** Saved product ids, newest first. Works with or without an account. */
const wishlistStore = createLocalStore<{ productIds: string[] }>(
  "northstar:wishlist",
  { productIds: [] },
  z.object({ productIds: z.array(z.string()) }),
);

/** Adds or removes a product; returns whether it's saved afterwards. */
function toggleWishlist(productId: string) {
  const saved = wishlistStore.getState().productIds.includes(productId);
  wishlistStore.setState((state) => ({
    productIds: saved
      ? state.productIds.filter((id) => id !== productId)
      : [productId, ...state.productIds],
  }));
  return !saved;
}

function clearWishlist() {
  wishlistStore.setState({ productIds: [] });
}

export { clearWishlist, toggleWishlist, wishlistStore };
