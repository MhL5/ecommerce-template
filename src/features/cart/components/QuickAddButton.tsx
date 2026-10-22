"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { addToCart, maxQuantityFor } from "@/features/cart/api/cart-store";
import { useCartQuantity } from "@/features/cart/hooks/use-cart";
import type { Product } from "@/features/products/types";
import { useHydrated } from "@/hooks/use-hydrated";
import { ShoppingBagAddIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";

/** One-tap "add 1 to cart" for product cards. */
function QuickAddButton({ product }: { product: Product }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const inCart = useCartQuantity(product.id);
  const soldOut = product.stock <= 0;
  const full = inCart >= maxQuantityFor(product.id);
  const label = soldOut
    ? "Sold out"
    : full
      ? "Maximum already in cart"
      : `Add ${product.name} to cart`;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={label}
            disabled={!hydrated || soldOut || full}
            onClick={() => {
              if (addToCart(product.id, 1) === 0) return;
              toast.add({
                type: "success",
                title: "Added to cart",
                description: product.name,
                actionProps: {
                  children: "View cart",
                  onClick: () => router.push("/cart"),
                },
              });
            }}
          />
        }
      >
        <HugeiconsIcon icon={ShoppingBagAddIcon} strokeWidth={2} />
      </TooltipTrigger>
      <TooltipContent>
        {soldOut ? "Sold out" : full ? "Limit reached" : "Add to cart"}
      </TooltipContent>
    </Tooltip>
  );
}

export { QuickAddButton };
