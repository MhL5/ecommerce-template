"use client";

import {
  getBrands,
  getCategories,
  getPriceBounds,
  getProductFacets,
  queryProducts,
} from "@/features/products/api";
import { useCatalog } from "@/features/products/api/catalog-store";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { ActiveFilters } from "@/features/products/components/listing/ActiveFilters";
import { MobileFilters } from "@/features/products/components/listing/MobileFilters";
import { NoResults } from "@/features/products/components/listing/NoResults";
import { PendingRegion } from "@/features/products/components/listing/PendingRegion";
import {
  type FilterOptions,
  ProductFilters,
} from "@/features/products/components/listing/ProductFilters";
import { ProductPagination } from "@/features/products/components/listing/ProductPagination";
import { ProductSearch } from "@/features/products/components/listing/ProductSearch";
import { ProductSortSelect } from "@/features/products/components/listing/ProductSortSelect";
import { ResultsSummary } from "@/features/products/components/listing/ResultsSummary";
import { useProductQuery } from "@/features/products/hooks/use-product-query";
import type {
  CategoryId,
  Product,
  ProductQuery,
} from "@/features/products/types";

function getFilterOptions(
  query: ProductQuery,
  catalog: Product[],
): FilterOptions {
  const facets = getProductFacets(query, catalog);
  const bounds = getPriceBounds(catalog);

  return {
    categories: getCategories().map(({ id, name }) => ({ id, name })),
    brands: getBrands(catalog),
    categoryCounts: Object.fromEntries(facets.categories),
    brandCounts: Object.fromEntries(facets.brands),
    // Whole $50 steps keep the slider labels tidy.
    priceRange: {
      min: 0,
      max: Math.ceil(bounds.max / 5000) * 5000,
    },
  };
}

function ProductListingView() {
  const { query } = useProductQuery();
  const catalog = useCatalog();
  const result = queryProducts(query, catalog);
  const options = getFilterOptions(query, catalog);
  const categoryNames = Object.fromEntries(
    options.categories.map(({ id, name }) => [id, name]),
  ) as Record<CategoryId, string>;

  return (
    <div className="grid gap-8 lg:grid-cols-[15rem_1fr]">
      <aside className="hidden lg:block">
        <ProductFilters
          options={options}
          className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pe-2"
        />
      </aside>
      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3">
          <ProductSearch className="flex-1 basis-60" />
          <div className="flex gap-3">
            <MobileFilters options={options} total={result.total} />
            <ProductSortSelect />
          </div>
        </div>
        <ActiveFilters categoryNames={categoryNames} />
        <PendingRegion className="flex flex-col gap-4">
          <ResultsSummary result={result} />
          {result.total === 0 ? (
            <NoResults />
          ) : (
            <ProductGrid products={result.items} priorityCount={4} />
          )}
          <ProductPagination query={query} result={result} />
        </PendingRegion>
      </div>
    </div>
  );
}

export { ProductListingView };
