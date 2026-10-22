"use client";

import { QuickAddButton } from "@/features/cart/components/QuickAddButton";
import { useCatalog } from "@/features/products/api/catalog-store";
import { ProductCard } from "@/features/products/components/ProductCard";
import type { Product } from "@/features/products/types";
import { WishlistButton } from "@/features/wishlist/components/WishlistButton";
import { cn } from "@/lib/utils";

type ProductGridProps = {
  products: Product[];
  /** Number of leading images to load eagerly (above the fold). */
  priorityCount?: number;
  className?: string;
};

/**
 * Renders the given products with any admin edits applied (and admin-deleted
 * ones dropped). On the server this is just the base data.
 */
function ProductGrid({
  products,
  priorityCount = 0,
  className,
}: ProductGridProps) {
  const catalog = useCatalog();
  const byId = new Map(catalog.map((product) => [product.id, product]));
  const live = products.flatMap((product) => {
    const current = byId.get(product.id);
    return current ? [current] : [];
  });

  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {live.map((product, index) => (
        <li key={product.id} className="flex">
          <ProductCard
            product={product}
            action={<QuickAddButton product={product} />}
            imageAction={<WishlistButton product={product} variant="overlay" />}
            priority={index < priorityCount}
            className="w-full"
          />
        </li>
      ))}
    </ul>
  );
}

export { ProductGrid };
