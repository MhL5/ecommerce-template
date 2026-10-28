import type {
  Product,
  ProductOption,
  ProductVariant,
} from "@/features/products/types";

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

function hasVariants(product: Pick<Product, "variants">): product is Product & {
  options: ProductOption[];
  variants: ProductVariant[];
} {
  return (product.variants?.length ?? 0) > 0;
}

function findVariant(
  product: Pick<Product, "variants">,
  variantId: string | undefined,
) {
  if (!variantId) return undefined;
  return product.variants?.find((variant) => variant.id === variantId);
}

/** Stock for a cart line: the variant's when one is chosen, else the product's. */
function getLineStock(
  product: Pick<Product, "stock" | "variants">,
  variantId: string | undefined,
) {
  if (!hasVariants(product)) return product.stock;
  return findVariant(product, variantId)?.stock ?? 0;
}

function slugifyValue(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Every combination of option values as a variant. `product.stock` is split
 * evenly across the variants that aren't listed in `soldOut`.
 */
function buildVariants(
  product: Pick<Product, "id" | "stock">,
  options: ProductOption[],
  soldOut: string[] = [],
): ProductVariant[] {
  const combos = options.reduce<string[][]>(
    (acc, option) =>
      acc.flatMap((combo) => option.values.map((v) => [...combo, v.value])),
    [[]],
  );
  const titleOf = (values: string[]) => values.join(" / ");
  let available = combos.filter((c) => !soldOut.includes(titleOf(c))).length;
  let remaining = product.stock;

  return combos.map((values) => {
    const title = titleOf(values);
    const stock = soldOut.includes(title)
      ? 0
      : Math.ceil(remaining / Math.max(1, available--));
    remaining -= stock;
    const suffix = values.map(slugifyValue).join("-");
    return {
      id: `${product.id}-${suffix}`,
      title,
      values,
      sku: `NS-${product.id.toUpperCase()}-${suffix.toUpperCase()}`,
      stock,
    };
  });
}

export {
  buildVariants,
  findVariant,
  getLineStock,
  hasVariants,
  getDiscountPercent,
  getStockStatus,
  isOnSale,
  LOW_STOCK_THRESHOLD,
  type StockStatus,
};
