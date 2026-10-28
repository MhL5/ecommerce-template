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
import { SectionHeading } from "@/features/home/components/SectionHeading";
import { getCategoryById, getRelatedProducts } from "@/features/products/api";
import {
  isBaseProduct,
  useCatalog,
} from "@/features/products/api/catalog-store";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { ProductBreadcrumb } from "@/features/products/components/detail/ProductBreadcrumb";
import { ProductDetailSkeleton } from "@/features/products/components/detail/ProductDetailSkeleton";
import { ProductGallery } from "@/features/products/components/detail/ProductGallery";
import { ProductInfo } from "@/features/products/components/detail/ProductInfo";
import { ProductPurchase } from "@/features/products/components/detail/ProductPurchase";
import { ProductTabs } from "@/features/products/components/detail/ProductTabs";
import type { Product } from "@/features/products/types";
import { productsHref } from "@/features/products/utils/query";
import { useProductReviews } from "@/features/reviews/hooks/use-reviews";
import { WishlistButton } from "@/features/wishlist/components/WishlistButton";
import { useHydrated } from "@/hooks/use-hydrated";
import { PackageRemoveIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

function ProductUnavailable() {
  return (
    <Empty className="py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={PackageRemoveIcon} strokeWidth={2} />
        </EmptyMedia>
        <EmptyTitle>This product isn’t available</EmptyTitle>
        <EmptyDescription>
          It may have been removed from the shop, or the link is wrong.
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

/**
 * Looks the product up in the merged catalogue so admin edits apply and
 * admin-created products (unknown to the server) still get a page.
 */
function ProductDetail({ slug }: { slug: string }) {
  const catalog = useCatalog();
  const hydrated = useHydrated();
  const product = catalog.find((entry) => entry.slug === slug);

  if (!product) {
    // Before hydration only base products are known; admin-created ones
    // appear once localStorage has been read.
    return hydrated ? <ProductUnavailable /> : <ProductDetailSkeleton />;
  }

  return <ProductPage product={product} />;
}

function ProductPage({ product }: { product: Product }) {
  const catalog = useCatalog();
  const reviews = useProductReviews(product);
  const category = getCategoryById(product.categoryId);

  return (
    <div className="flex flex-col gap-12">
      {/* Admin-created products have no server metadata; React hoists this. */}
      {!isBaseProduct(product.id) && (
        <title>{`${product.name} · Northstar`}</title>
      )}
      <div className="flex flex-col gap-6">
        <ProductBreadcrumb product={product} category={category} />
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductGallery
            images={product.images}
            name={product.name}
            soldOut={product.stock <= 0}
          />
          <ProductInfo
            // Published customer reviews count towards the header rating.
            product={{
              ...product,
              rating: reviews.rating,
              reviewCount: reviews.reviewCount,
            }}
          >
            <div className="flex flex-col gap-3">
              <ProductPurchase product={product} />
              <WishlistButton product={product} className="sm:w-fit" />
            </div>
          </ProductInfo>
        </div>
      </div>
      <ProductTabs product={product} reviews={reviews} />
      <section className="flex flex-col gap-6">
        <SectionHeading
          title="You may also like"
          href={productsHref({ categories: [product.categoryId] })}
          linkLabel={category ? `More ${category.name}` : "View all"}
        />
        <ProductGrid products={getRelatedProducts(product, 4, catalog)} />
      </section>
    </div>
  );
}

export { ProductDetail };
