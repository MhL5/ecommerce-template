import type { Product, ProductVariant } from "@/features/products/types";

/** Identifies a cart line: a product, plus the variant for products with options. */
type CartLineKey = {
  productId: string;
  variantId?: string;
};

type CartLine = CartLineKey & {
  quantity: number;
};

type CartState = {
  lines: CartLine[];
};

/** A cart line joined with its catalogue product. */
type CartItem = CartLine & {
  product: Product;
  variant?: ProductVariant;
  /** `product.price * quantity`, in cents. */
  lineTotal: number;
};

export type { CartItem, CartLine, CartLineKey, CartState };
