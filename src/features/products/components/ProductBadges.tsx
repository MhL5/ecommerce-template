import { Badge } from "@/components/ui/badge";
import type { Product } from "@/features/products/types";
import {
  getDiscountPercent,
  getStockStatus,
} from "@/features/products/utils/product";
import { cn } from "@/lib/utils";

type ProductBadgesProps = {
  product: Pick<Product, "price" | "compareAtPrice" | "stock">;
  className?: string;
};

function ProductBadges({ product, className }: ProductBadgesProps) {
  const discount = getDiscountPercent(product);
  const stock = getStockStatus(product);

  if (!discount && stock === "in-stock") return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {discount > 0 && <Badge>-{discount}%</Badge>}
      {stock === "out-of-stock" && <Badge variant="secondary">Sold out</Badge>}
      {stock === "low-stock" && (
        <Badge variant="outline" className="bg-background">
          Only {product.stock} left
        </Badge>
      )}
    </div>
  );
}

function StockBadge({ product }: { product: Pick<Product, "stock"> }) {
  const stock = getStockStatus(product);
  if (stock === "out-of-stock")
    return <Badge variant="destructive">Out of stock</Badge>;
  if (stock === "low-stock")
    return <Badge variant="outline">Low stock · {product.stock} left</Badge>;
  return <Badge variant="secondary">In stock</Badge>;
}

export { ProductBadges, StockBadge };
