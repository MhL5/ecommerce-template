import { Separator } from "@/components/ui/separator";
import { StockBadge } from "@/features/products/components/ProductBadges";
import { ProductPrice } from "@/features/products/components/ProductPrice";
import { ProductRating } from "@/features/products/components/ProductRating";
import type { Product } from "@/features/products/types";
import { getDiscountPercent } from "@/features/products/utils/product";
import { formatPrice } from "@/lib/format";
import { Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactNode } from "react";

type ProductInfoProps = {
  product: Product;
  /** Purchase controls (quantity + add to cart), rendered under the price. */
  children?: ReactNode;
};

function ProductInfo({ product, children }: ProductInfoProps) {
  const discount = getDiscountPercent(product);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-muted-foreground">
          {product.brand}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {product.name}
        </h1>
        <a
          href="#reviews"
          className="w-fit rounded-sm outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ProductRating
            rating={product.rating}
            reviewCount={product.reviewCount}
          />
        </a>
      </div>

      <div className="flex flex-col gap-2">
        <ProductPrice product={product} size="lg" />
        {discount > 0 && product.compareAtPrice && (
          <p className="text-sm text-muted-foreground">
            You save {formatPrice(product.compareAtPrice - product.price)} (
            {discount}%)
          </p>
        )}
        <div>
          <StockBadge product={product} />
        </div>
      </div>

      <p className="text-pretty text-muted-foreground">{product.description}</p>

      {children}

      <Separator />

      <ul className="grid gap-2 text-sm sm:grid-cols-2">
        {product.highlights.map((highlight) => (
          <li key={highlight} className="flex items-start gap-2">
            <HugeiconsIcon
              icon={Tick02Icon}
              strokeWidth={2}
              className="mt-0.5 size-4 shrink-0 text-primary"
            />
            {highlight}
          </li>
        ))}
      </ul>
    </section>
  );
}

export { ProductInfo };
