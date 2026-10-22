import type { CartState } from "@/features/cart/types";
import { getCatalogProduct } from "@/features/products/api/catalog-store";
import { createLocalStore } from "@/lib/createLocalStore";
import { z } from "zod";

/** Per-line cap, on top of the product's stock. */
const MAX_QUANTITY_PER_LINE = 10;

const cartSchema = z.object({
  lines: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    }),
  ),
});

const cartStore = createLocalStore<CartState>(
  "northstar:cart",
  { lines: [] },
  cartSchema,
);

function maxQuantityFor(productId: string) {
  const stock = getCatalogProduct(productId)?.stock ?? 0;
  return Math.min(stock, MAX_QUANTITY_PER_LINE);
}

/**
 * Adds `quantity` of a product, merging with an existing line and clamping to
 * stock. Returns how many units were actually added (0 if none fit).
 */
function addToCart(productId: string, quantity = 1) {
  const max = maxQuantityFor(productId);
  const existing =
    cartStore.getState().lines.find((line) => line.productId === productId)
      ?.quantity ?? 0;
  const next = Math.min(existing + quantity, max);
  const added = Math.max(0, next - existing);
  if (added === 0) return 0;

  cartStore.setState((state) => ({
    lines: existing
      ? state.lines.map((line) =>
          line.productId === productId ? { ...line, quantity: next } : line,
        )
      : [...state.lines, { productId, quantity: next }],
  }));
  return added;
}

/** Sets a line's quantity; 0 or less removes it. */
function setCartQuantity(productId: string, quantity: number) {
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  const clamped = Math.min(Math.floor(quantity), maxQuantityFor(productId));
  cartStore.setState((state) => ({
    lines: state.lines.map((line) =>
      line.productId === productId ? { ...line, quantity: clamped } : line,
    ),
  }));
}

function removeFromCart(productId: string) {
  cartStore.setState((state) => ({
    lines: state.lines.filter((line) => line.productId !== productId),
  }));
}

function clearCart() {
  cartStore.setState({ lines: [] });
}

export {
  addToCart,
  cartStore,
  clearCart,
  MAX_QUANTITY_PER_LINE,
  maxQuantityFor,
  removeFromCart,
  setCartQuantity,
};
