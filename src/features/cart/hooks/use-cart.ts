import { cartStore } from "@/features/cart/api/cart-store";
import type { CartItem } from "@/features/cart/types";
import { useCatalog } from "@/features/products/api/catalog-store";
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
    // Lines for products the admin deleted simply drop out.
    const product = catalog.find((entry) => entry.id === line.productId);
    return product
      ? [{ ...line, product, lineTotal: product.price * line.quantity }]
      : [];
  });

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return { items, count, subtotal, hydrated };
}

/** Quantity of one product currently in the cart. */
function useCartQuantity(productId: string) {
  const state = cartStore.useStore();
  return (
    state.lines.find((line) => line.productId === productId)?.quantity ?? 0
  );
}

export { useCart, useCartQuantity };
