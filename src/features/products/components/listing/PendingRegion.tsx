"use client";

import { useProductQuery } from "@/features/products/hooks/use-product-query";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** Dims its children while a filter change is loading. */
function PendingRegion({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { isPending } = useProductQuery();

  return (
    <div
      aria-busy={isPending}
      data-pending={isPending}
      className={cn(
        "transition-opacity duration-200 data-[pending=true]:opacity-50",
        className,
      )}
    >
      {children}
    </div>
  );
}

export { PendingRegion };
