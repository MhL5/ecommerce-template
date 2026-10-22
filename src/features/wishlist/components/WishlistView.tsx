"use client";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Link } from "@/components/ui/link";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { ProductGridSkeleton } from "@/features/products/components/listing/ProductListingSkeleton";
import { clearWishlist } from "@/features/wishlist/api/wishlist-store";
import { useWishlist } from "@/features/wishlist/hooks/use-wishlist";
import { pluralize } from "@/lib/format";
import { FavouriteIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

function WishlistView() {
  const { products, count, hydrated } = useWishlist();

  if (!hydrated) return <ProductGridSkeleton count={4} />;

  if (count === 0) {
    return (
      <Empty className="border border-dashed py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={FavouriteIcon} strokeWidth={2} />
          </EmptyMedia>
          <EmptyTitle>Nothing saved yet</EmptyTitle>
          <EmptyDescription>
            Tap the heart on any product to keep it here for later.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button nativeButton={false} render={<Link href="/products" />}>
            Browse products
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {pluralize(count, "saved item")}
        </p>
        <Button variant="ghost" size="sm" onClick={() => clearWishlist()}>
          Clear all
        </Button>
      </div>
      <ProductGrid products={products} />
    </div>
  );
}

export { WishlistView };
