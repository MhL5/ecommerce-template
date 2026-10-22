"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  type FilterOptions,
  ProductFilters,
} from "@/features/products/components/listing/ProductFilters";
import { useProductQuery } from "@/features/products/hooks/use-product-query";
import { countActiveFilters } from "@/features/products/utils/query";
import { pluralize } from "@/lib/format";
import { FilterHorizontalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

function MobileFilters({
  options,
  total,
}: {
  options: FilterOptions;
  total: number;
}) {
  const { query } = useProductQuery();
  const activeCount = countActiveFilters(query);

  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" className="lg:hidden" />}>
        <HugeiconsIcon
          icon={FilterHorizontalIcon}
          strokeWidth={2}
          data-icon="inline-start"
        />
        Filters
        {activeCount > 0 && <Badge>{activeCount}</Badge>}
      </SheetTrigger>
      <SheetContent side="left" className="w-[22rem] gap-0">
        <SheetHeader className="border-b">
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Narrow down the catalogue.</SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <ProductFilters options={options} className="p-4" />
        </ScrollArea>
        <SheetFooter className="border-t">
          <SheetClose render={<Button />}>
            Show {pluralize(total, "result")}
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export { MobileFilters };
