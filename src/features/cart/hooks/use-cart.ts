import { cartStore } from "@/features/cart/api/cart-store";
import type { CartItem, CartLineKey } from "@/features/cart/types";
import { useCatalog } from "@/features/products/api/catalog-store";
import { findVariant, hasVariants } from "@/features/products/utils/product";
import { useHydrated } from "@/hooks/use-hydrated";

/**
 * Cart lines joined with catalogue data. `hydrated` is false on the server
 * and during hydration, when the cart always reads as empty.
 */
function useCart() {
  const state = cartStore.useStore();
  const catalog = useCatalog();
  const hydrated = useHydrated();

  const items: CartItem[] = state.lines.flatMap((line) => {
    // Lines for products (or variants) that no longer exist simply drop out.
    const product = catalog.find((entry) => entry.id === line.productId);
    if (!product) return [];
    const variant = findVariant(product, line.variantId);
    if (hasVariants(product) !== Boolean(variant)) return [];
    return [
      {
        ...line,
        product,
        ...(variant ? { variant } : {}),
        lineTotal: product.price * line.quantity,
      },
    ];
  });

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return { items, count, subtotal, hydrated };
}

/** Quantity of one product (variant) currently in the cart. */
function useCartQuantity({ productId, variantId }: CartLineKey) {
  const state = cartStore.useStore();
  return (
    state.lines.find(
      (line) => line.productId === productId && line.variantId === variantId,
    )?.quantity ?? 0
  );
}

export { useCart, useCartQuantity };
