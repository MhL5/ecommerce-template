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
import { useProductQuery } from "@/features/products/hooks/use-product-query";
import { DEFAULT_QUERY } from "@/features/products/utils/query";
import { SearchRemoveIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

function NoResults() {
  const { query, setQuery } = useProductQuery();

  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={SearchRemoveIcon} strokeWidth={2} />
        </EmptyMedia>
        <EmptyTitle>No products match</EmptyTitle>
        <EmptyDescription>
          {query.q
            ? `Nothing found for “${query.q}” with these filters.`
            : "Nothing fits this combination of filters."}{" "}
          Try removing a filter or searching for something broader.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          variant="outline"
          onClick={() => setQuery({ ...DEFAULT_QUERY, sort: query.sort })}
        >
          Clear search and filters
        </Button>
      </EmptyContent>
    </Empty>
  );
}

export { NoResults };
