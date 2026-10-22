import type { Product } from "@/features/products/types";
import { isOnSale } from "@/features/products/utils/product";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

type ProductPriceProps = {
  product: Pick<Product, "price" | "compareAtPrice">;
  size?: "default" | "lg";
  className?: string;
};

function ProductPrice({
  product,
  size = "default",
  className,
}: ProductPriceProps) {
  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span
        className={cn(
          "font-semibold tabular-nums",
          size === "lg" && "text-2xl",
        )}
      >
        {formatPrice(product.price)}
      </span>
      {isOnSale(product) && product.compareAtPrice && (
        <span
          className={cn(
            "text-muted-foreground tabular-nums line-through",
            size === "default" && "text-sm",
          )}
        >
          <span className="sr-only">Was </span>
          {formatPrice(product.compareAtPrice)}
        </span>
      )}
    </div>
  );
}

export { ProductPrice };
