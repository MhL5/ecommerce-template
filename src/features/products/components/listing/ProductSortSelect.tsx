"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProductQuery } from "@/features/products/hooks/use-product-query";
import type { ProductSort } from "@/features/products/types";
import { SORT_OPTIONS } from "@/features/products/utils/query";

function ProductSortSelect() {
  const { query, setQuery } = useProductQuery();

  return (
    <Select
      items={SORT_OPTIONS}
      value={query.sort}
      onValueChange={(value) => {
        if (value) setQuery({ sort: value as ProductSort });
      }}
    >
      <SelectTrigger className="w-48" aria-label="Sort products">
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} align="end">
        <SelectGroup>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export { ProductSortSelect };
