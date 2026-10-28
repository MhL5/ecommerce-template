"use client";

import { Img } from "@/components/ui/Img";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import {
  maxQuantityFor,
  removeFromCart,
  setCartQuantity,
} from "@/features/cart/api/cart-store";
import { QuantitySelector } from "@/features/cart/components/QuantitySelector";
import type { CartItem } from "@/features/cart/types";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

type CartLineItemProps = {
  item: CartItem;
  size?: "default" | "sm";
  className?: string;
};

function CartLineItem({
  item,
  size = "default",
  className,
}: CartLineItemProps) {
  const { product, variant, quantity } = item;
  const key = { productId: item.productId, variantId: item.variantId };
  const max = Math.max(quantity, maxQuantityFor(key));
  const href = variant
    ? (`/products/${product.slug}?variant=${variant.id}` as const)
    : (`/products/${product.slug}` as const);
  const compact = size === "sm";

  return (
    <div className={cn("flex gap-4", className)}>
      <Link
        href={href}
        className={cn(
          "relative shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          compact ? "size-16" : "size-24",
        )}
      >
        <Img
          src={product.images[0] ?? ""}
          alt={product.name}
          fill
          sizes="96px"
          className="object-cover"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <Link
              href={href}
              className="truncate rounded-sm font-medium outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {product.name}
            </Link>
            {variant && <p className="text-xs">{variant.title}</p>}
            <p className="text-xs text-muted-foreground">
              {product.brand} · {formatPrice(product.price)} each
            </p>
          </div>
          <p className="font-medium tabular-nums">
            {formatPrice(item.lineTotal)}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <QuantitySelector
            size="sm"
            value={quantity}
            max={max}
            label={`Quantity of ${product.name}`}
            onChange={(next) => setCartQuantity(key, next)}
          />
          <Button
            variant="ghost"
            size={compact ? "icon-sm" : "sm"}
            aria-label={`Remove ${product.name}`}
            onClick={() => removeFromCart(key)}
          >
            <HugeiconsIcon
              icon={Delete02Icon}
              strokeWidth={2}
              data-icon={compact ? undefined : "inline-start"}
            />
            {!compact && "Remove"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export { CartLineItem };
