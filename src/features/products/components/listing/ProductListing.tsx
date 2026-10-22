import { ListingHeader } from "@/features/products/components/listing/ListingHeader";
import { ProductListingView } from "@/features/products/components/listing/ProductListingView";
import { ProductQueryProvider } from "@/features/products/hooks/use-product-query";
import {
  type RawSearchParams,
  parseProductQuery,
} from "@/features/products/utils/query";

type ProductListingProps = {
  searchParams: Promise<RawSearchParams>;
};

/**
 * Reads the URL (a runtime API), so the page renders it inside Suspense.
 * Results are computed in the client view so admin catalogue edits apply;
 * on the server that view renders the base catalogue.
 */
async function ProductListing({ searchParams }: ProductListingProps) {
  const query = parseProductQuery(await searchParams);

  return (
    <>
      <ListingHeader query={query} />
      <ProductQueryProvider query={query}>
        <ProductListingView />
      </ProductQueryProvider>
    </>
  );
}

export { ProductListing };
