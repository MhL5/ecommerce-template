import { useCatalog } from "@/features/products/api/catalog-store";
import type { Product } from "@/features/products/types";
import { wishlistStore } from "@/features/wishlist/api/wishlist-store";
import { useHydrated } from "@/hooks/use-hydrated";

/** Saved products (deleted ones drop out), newest first. */
function useWishlist() {
  const { productIds } = wishlistStore.useStore();
  const catalog = useCatalog();
  const hydrated = useHydrated();

  const products = productIds.flatMap((id) => {
    const product = catalog.find((entry) => entry.id === id);
    return product ? [product] : [];
  }) satisfies Product[];

  return { products, count: products.length, hydrated };
}

function useIsWishlisted(productId: string) {
  return wishlistStore.useStore().productIds.includes(productId);
}

export { useIsWishlisted, useWishlist };
