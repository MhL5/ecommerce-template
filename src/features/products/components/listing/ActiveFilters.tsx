"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProductQuery } from "@/features/products/hooks/use-product-query";
import type { CategoryId, ProductQuery } from "@/features/products/types";
import { formatPrice } from "@/lib/format";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

type Chip = { key: string; label: string; patch: Partial<ProductQuery> };

function getChips(
  query: ProductQuery,
  categoryNames: Record<string, string>,
): Chip[] {
  const chips: Chip[] = [];

  if (query.q) {
    chips.push({ key: "q", label: `“${query.q}”`, patch: { q: "" } });
  }
  for (const id of query.categories) {
    chips.push({
      key: `category-${id}`,
      label: categoryNames[id] ?? id,
      patch: {
        categories: query.categories.filter((other) => other !== id),
      },
    });
  }
  for (const brand of query.brands) {
    chips.push({
      key: `brand-${brand}`,
      label: brand,
      patch: { brands: query.brands.filter((other) => other !== brand) },
    });
  }
  if (query.minPrice !== null || query.maxPrice !== null) {
    const min = query.minPrice !== null ? formatPrice(query.minPrice) : "$0";
    const max = query.maxPrice !== null ? formatPrice(query.maxPrice) : "any";
    chips.push({
      key: "price",
      label: `${min} – ${max}`,
      patch: { minPrice: null, maxPrice: null },
    });
  }
  if (query.minRating !== null) {
    chips.push({
      key: "rating",
      label: `${query.minRating}★ & up`,
      patch: { minRating: null },
    });
  }
  if (query.inStock) {
    chips.push({ key: "stock", label: "In stock", patch: { inStock: false } });
  }
  if (query.onSale) {
    chips.push({ key: "sale", label: "On sale", patch: { onSale: false } });
  }

  return chips;
}

function ActiveFilters({
  categoryNames,
}: {
  categoryNames: Record<CategoryId, string>;
}) {
  const { query, setQuery } = useProductQuery();
  const chips = getChips(query, categoryNames);

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Active filters:</span>
      {chips.map((chip) => (
        <Badge
          key={chip.key}
          variant="secondary"
          className="h-7 cursor-pointer gap-1.5 ps-2.5 pe-1.5 text-sm"
          render={
            <button
              type="button"
              aria-label={`Remove filter ${chip.label}`}
              onClick={() => setQuery(chip.patch)}
            />
          }
        >
          {chip.label}
          <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
        </Badge>
      ))}
      {chips.length > 1 && (
        <Button
          variant="link"
          size="sm"
          className="px-1"
          onClick={() =>
            setQuery({
              q: "",
              categories: [],
              brands: [],
              minPrice: null,
              maxPrice: null,
              minRating: null,
              inStock: false,
              onSale: false,
            })
          }
        >
          Clear all
        </Button>
      )}
    </div>
  );
}

export { ActiveFilters };
