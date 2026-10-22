import type { Product } from "@/features/products/types";

const LOW_STOCK_THRESHOLD = 10;

type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

function getStockStatus(product: Pick<Product, "stock">): StockStatus {
  if (product.stock <= 0) return "out-of-stock";
  if (product.stock <= LOW_STOCK_THRESHOLD) return "low-stock";
  return "in-stock";
}

function isOnSale(product: Pick<Product, "price" | "compareAtPrice">) {
  return (
    product.compareAtPrice !== undefined &&
    product.compareAtPrice > product.price
  );
}

/** Whole-number discount, e.g. `20` for 20% off. `0` when not on sale. */
function getDiscountPercent(
  product: Pick<Product, "price" | "compareAtPrice">,
) {
  if (!isOnSale(product) || !product.compareAtPrice) return 0;
  return Math.round(
    ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100,
  );
}

export {
  getDiscountPercent,
  getStockStatus,
  isOnSale,
  LOW_STOCK_THRESHOLD,
  type StockStatus,
};
