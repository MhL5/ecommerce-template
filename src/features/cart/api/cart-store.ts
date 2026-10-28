import type { CartLine, CartLineKey, CartState } from "@/features/cart/types";
import { getCatalogProduct } from "@/features/products/api/catalog-store";
import { getLineStock } from "@/features/products/utils/product";
import { createLocalStore } from "@/lib/createLocalStore";
import { z } from "zod";

/** Per-line cap, on top of the product's stock. */
const MAX_QUANTITY_PER_LINE = 10;

const cartSchema = z.object({
  lines: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string().optional(),
      quantity: z.number().int().positive(),
    }),
  ),
});

const cartStore = createLocalStore<CartState>(
  "northstar:cart",
  { lines: [] },
  cartSchema as z.ZodType<CartState>,
);

function sameLine(line: CartLineKey, key: CartLineKey) {
  return line.productId === key.productId && line.variantId === key.variantId;
}

/** Stable string for React keys. */
function lineKeyOf(key: CartLineKey) {
  return key.variantId ? `${key.productId}:${key.variantId}` : key.productId;
}

function maxQuantityFor(key: CartLineKey) {
  const product = getCatalogProduct(key.productId);
  const stock = product ? getLineStock(product, key.variantId) : 0;
  return Math.min(stock, MAX_QUANTITY_PER_LINE);
}

/**
 * Adds `quantity` of a product (variant), merging with an existing line and
 * clamping to stock. Returns how many units were actually added (0 if none fit).
 */
function addToCart(key: CartLineKey, quantity = 1) {
  const max = maxQuantityFor(key);
  const existing =
    cartStore.getState().lines.find((line) => sameLine(line, key))?.quantity ??
    0;
  const next = Math.min(existing + quantity, max);
  const added = Math.max(0, next - existing);
  if (added === 0) return 0;

  const newLine: CartLine = { productId: key.productId, quantity: next };
  if (key.variantId) newLine.variantId = key.variantId;

  cartStore.setState((state) => ({
    lines: existing
      ? state.lines.map((line) =>
          sameLine(line, key) ? { ...line, quantity: next } : line,
        )
      : [...state.lines, newLine],
  }));
  return added;
}

/** Sets a line's quantity; 0 or less removes it. */
function setCartQuantity(key: CartLineKey, quantity: number) {
  if (quantity <= 0) {
    removeFromCart(key);
    return;
  }
  const clamped = Math.min(Math.floor(quantity), maxQuantityFor(key));
  cartStore.setState((state) => ({
    lines: state.lines.map((line) =>
      sameLine(line, key) ? { ...line, quantity: clamped } : line,
    ),
  }));
}

function removeFromCart(key: CartLineKey) {
  cartStore.setState((state) => ({
    lines: state.lines.filter((line) => !sameLine(line, key)),
  }));
}

function clearCart() {
  cartStore.setState({ lines: [] });
}

export {
  addToCart,
  cartStore,
  clearCart,
  lineKeyOf,
  MAX_QUANTITY_PER_LINE,
  maxQuantityFor,
  removeFromCart,
  setCartQuantity,
};
