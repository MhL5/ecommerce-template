import { PageContainer } from "@/features/layout/components/PageContainer";
import { ListingHeader } from "@/features/products/components/listing/ListingHeader";
import { ProductListing } from "@/features/products/components/listing/ProductListing";
import { ProductListingSkeleton } from "@/features/products/components/listing/ProductListingSkeleton";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Shop all products",
  description: "Search, filter and sort the full Northstar catalogue.",
};

export default function ProductsPage({ searchParams }: PageProps<"/products">) {
  return (
    <PageContainer className="flex flex-col gap-8 py-8 sm:py-10">
      {/* The heading depends on the URL, so it renders with the listing. */}
      <Suspense
        fallback={
          <>
            <ListingHeader />
            <ProductListingSkeleton />
          </>
        }
      >
        <ProductListing searchParams={searchParams} />
      </Suspense>
    </PageContainer>
  );
}
