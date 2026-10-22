import type { ShippingMethodId } from "@/features/cart/utils/totals";

type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled";

/** Snapshot of a product at purchase time, so old orders stay accurate. */
type OrderItem = {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  /** Unit price in cents. */
  price: number;
  quantity: number;
};

type OrderAddress = {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone: string;
};

type Order = {
  id: string;
  /** Human-friendly reference shown to customers, e.g. `NS-4F7K2Q`. */
  number: string;
  createdAt: string;
  status: OrderStatus;
  /** Account that placed the order, or `null` for guest checkout. */
  userId: string | null;
  email: string;
  items: OrderItem[];
  shippingAddress: OrderAddress;
  shippingMethod: ShippingMethodId;
  totals: {
    subtotal: number;
    /** Cents off from a discount code (0 when none was used). */
    discount: number;
    shipping: number;
    tax: number;
    total: number;
  };
  /** Code applied at checkout, e.g. `WELCOME10`. */
  discountCode?: string;
  payment: { brand: string; last4: string };
};

export type { Order, OrderAddress, OrderItem, OrderStatus };
