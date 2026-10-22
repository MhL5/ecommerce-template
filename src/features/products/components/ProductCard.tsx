import { Img } from "@/components/ui/Img";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "@/components/ui/link";
import { ProductBadges } from "@/features/products/components/ProductBadges";
import { ProductPrice } from "@/features/products/components/ProductPrice";
import { ProductRating } from "@/features/products/components/ProductRating";
import type { Product } from "@/features/products/types";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type ProductCardProps = {
  product: Product;
  /** Optional slot rendered next to the price, e.g. a quick add button. */
  action?: ReactNode;
  /** Optional slot pinned to the image corner, e.g. a wishlist toggle. */
  imageAction?: ReactNode;
  priority?: boolean;
  className?: string;
};

function ProductCard({
  product,
  action,
  imageAction,
  priority = false,
  className,
}: ProductCardProps) {
  const soldOut = product.stock <= 0;

  return (
    <Card className={cn("group/product relative gap-4 pt-0", className)}>
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Img
          src={product.images[0] ?? ""}
          alt={product.name}
          fill
          priority={priority}
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
          className={cn(
            "object-cover transition-transform duration-300 ease-out group-hover/product:scale-[1.03]",
            soldOut && "opacity-60 grayscale",
          )}
        />
        <ProductBadges product={product} className="absolute start-3 top-3" />
        {imageAction && (
          <div className="absolute end-2 top-2 z-10">{imageAction}</div>
        )}
      </div>
      <CardContent className="flex flex-1 flex-col gap-1.5">
        <p className="text-xs text-muted-foreground">{product.brand}</p>
        <h3 className="line-clamp-2 leading-snug font-medium">
          <Link
            href={`/products/${product.slug}`}
            className="outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
          >
            {product.name}
          </Link>
        </h3>
        <ProductRating
          rating={product.rating}
          reviewCount={product.reviewCount}
          size="sm"
        />
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-2">
        <ProductPrice product={product} />
        {action && <div className="relative z-10">{action}</div>}
      </CardFooter>
    </Card>
  );
}

export { ProductCard };
