import type { Product } from "@/features/products/types";

type CartLine = {
  productId: string;
  quantity: number;
};

type CartState = {
  lines: CartLine[];
};

/** A cart line joined with its catalogue product. */
type CartItem = CartLine & {
  product: Product;
  /** `product.price * quantity`, in cents. */
  lineTotal: number;
};

export type { CartItem, CartLine, CartState };
