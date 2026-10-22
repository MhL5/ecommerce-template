import { Img } from "@/components/ui/Img";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/components/ui/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StockBadge } from "@/features/products/components/ProductBadges";
import type { Product } from "@/features/products/types";
import { isOnSale } from "@/features/products/utils/product";
import { formatPrice } from "@/lib/format";
import type { ReactNode } from "react";

type ProductChange = "new" | "edited";

function AdminProductTable({
  products,
  categoryNames,
  changes = {},
  renderActions,
}: {
  products: Product[];
  categoryNames: Record<string, string>;
  /** Marks products added or edited in the admin. */
  changes?: Record<string, ProductChange>;
  renderActions?: (product: Product) => ReactNode;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-64 ps-6">Product</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-end">Price</TableHead>
          <TableHead className="text-end">Stock</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-end">Rating</TableHead>
          {renderActions && (
            <TableHead className="pe-6">
              <span className="sr-only">Actions</span>
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell className="ps-6">
              <div className="flex items-center gap-3">
                <span className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-foreground/10">
                  <Img
                    src={product.images[0] ?? ""}
                    alt=""
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="flex items-center gap-2">
                    <Link
                      href={`/products/${product.slug}`}
                      className="truncate rounded-sm font-medium outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      {product.name}
                    </Link>
                    {changes[product.id] === "new" && (
                      <Badge variant="secondary">New</Badge>
                    )}
                    {changes[product.id] === "edited" && (
                      <Badge variant="outline">Edited</Badge>
                    )}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {product.brand} · NS-{product.id.toUpperCase()}
                  </span>
                </span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {categoryNames[product.categoryId] ?? product.categoryId}
            </TableCell>
            <TableCell className="text-end tabular-nums">
              <span className="flex flex-col items-end">
                {formatPrice(product.price)}
                {isOnSale(product) && product.compareAtPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </span>
            </TableCell>
            <TableCell className="text-end tabular-nums">
              {product.stock}
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                <StockBadge product={product} />
                {isOnSale(product) && <Badge variant="outline">On sale</Badge>}
                {product.featured && (
                  <Badge variant="secondary">Featured</Badge>
                )}
              </div>
            </TableCell>
            <TableCell className="text-end tabular-nums">
              {product.reviewCount === 0 ? (
                <span className="text-xs text-muted-foreground">
                  No reviews
                </span>
              ) : (
                <>
                  {product.rating.toFixed(1)}
                  <span className="text-xs text-muted-foreground">
                    {" "}
                    ({product.reviewCount.toLocaleString("en-US")})
                  </span>
                </>
              )}
            </TableCell>
            {renderActions && (
              <TableCell className="pe-6 text-end">
                {renderActions(product)}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export { AdminProductTable, type ProductChange };
