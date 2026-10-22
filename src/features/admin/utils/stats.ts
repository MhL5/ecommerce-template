import type { Product } from "@/features/products/types";
import {
  type StockStatus,
  getStockStatus,
  isOnSale,
} from "@/features/products/utils/product";

type StockFilter = "all" | StockStatus;

function getInventoryStats(products: Product[]) {
  return {
    total: products.length,
    /** Retail value of everything in stock, in cents. */
    inventoryValue: products.reduce(
      (sum, product) => sum + product.price * product.stock,
      0,
    ),
    units: products.reduce((sum, product) => sum + product.stock, 0),
    lowStock: products.filter((p) => getStockStatus(p) === "low-stock").length,
    outOfStock: products.filter((p) => getStockStatus(p) === "out-of-stock")
      .length,
    onSale: products.filter(isOnSale).length,
  };
}

function filterAdminProducts(
  products: Product[],
  {
    search,
    categoryId,
    stock,
  }: { search: string; categoryId: string | null; stock: StockFilter },
) {
  const terms = search.toLowerCase().split(/\s+/).filter(Boolean);
  return products.filter((product) => {
    if (categoryId && product.categoryId !== categoryId) return false;
    if (stock !== "all" && getStockStatus(product) !== stock) return false;
    const haystack =
      `${product.name} ${product.brand} ${product.id} ${product.slug}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}

export { filterAdminProducts, getInventoryStats, type StockFilter };
