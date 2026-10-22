"use client";

import type { ProductQuery } from "@/features/products/types";
import { productsHref } from "@/features/products/utils/query";
import { useRouter } from "next/navigation";
import {
  type ReactNode,
  createContext,
  useContext,
  useTransition,
} from "react";

type ProductQueryContextValue = {
  query: ProductQuery;
  /** Merges `patch` into the URL query. Filters reset to page 1. */
  setQuery: (patch: Partial<ProductQuery>) => void;
  isPending: boolean;
};

const ProductQueryContext = createContext<ProductQueryContextValue | null>(
  null,
);

/**
 * The URL is the source of truth: the server parses `searchParams` and hands
 * the result down here; changing a filter pushes a new URL in a transition so
 * the current results stay on screen (dimmed) until the new ones arrive.
 */
function ProductQueryProvider({
  query,
  children,
}: {
  query: ProductQuery;
  children: ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function setQuery(patch: Partial<ProductQuery>) {
    const next = { ...query, page: 1, ...patch };
    startTransition(() => {
      router.push(productsHref(next), { scroll: false });
    });
  }

  return (
    <ProductQueryContext value={{ query, setQuery, isPending }}>
      {children}
    </ProductQueryContext>
  );
}

function useProductQuery() {
  const context = useContext(ProductQueryContext);
  if (!context) {
    throw new Error("useProductQuery must be used inside ProductQueryProvider");
  }
  return context;
}

export { ProductQueryProvider, useProductQuery };
