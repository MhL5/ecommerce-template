"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { addToCart, maxQuantityFor } from "@/features/cart/api/cart-store";
import { QuantitySelector } from "@/features/cart/components/QuantitySelector";
import { useCartQuantity } from "@/features/cart/hooks/use-cart";
import type { Product, ProductVariant } from "@/features/products/types";
import {
  LOW_STOCK_THRESHOLD,
  getLineStock,
  hasVariants,
} from "@/features/products/utils/product";
import { useHydrated } from "@/hooks/use-hydrated";
import { ShoppingBagAddIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

type AddToCartFormProps = {
  product: Product;
  /** The chosen variant, for products with options. */
  variant?: ProductVariant;
};

function AddToCartForm({ product, variant }: AddToCartFormProps) {
  const router = useRouter();
  const hydrated = useHydrated();
  const key = { productId: product.id, variantId: variant?.id };
  const inCart = useCartQuantity(key);
  const [quantity, setQuantity] = useState(1);
  const quantityId = useId();

  const needsVariant = hasVariants(product) && !variant;
  const stock = getLineStock(product, variant?.id);
  const maxForLine = maxQuantityFor(key);
  const remaining = Math.max(0, maxForLine - inCart);
  const soldOut = stock <= 0;
  const disabled = !hydrated || needsVariant || soldOut || remaining === 0;
  const selected = Math.min(quantity, Math.max(1, remaining));

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const added = addToCart(key, selected);
    if (added === 0) return;

    setQuantity(1);
    toast.add({
      type: "success",
      title: "Added to cart",
      description: `${added} × ${product.name}${variant ? ` (${variant.title})` : ""}`,
      actionProps: {
        children: "View cart",
        onClick: () => router.push("/cart"),
      },
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <Field className="w-auto">
          <FieldLabel htmlFor={quantityId}>Quantity</FieldLabel>
          <QuantitySelector
            id={quantityId}
            value={selected}
            onChange={setQuantity}
            max={Math.max(1, remaining)}
            disabled={disabled}
          />
        </Field>
        <Button
          type="submit"
          size="lg"
          className="flex-1 px-4"
          disabled={disabled}
        >
          <HugeiconsIcon
            icon={ShoppingBagAddIcon}
            strokeWidth={2}
            data-icon="inline-start"
          />
          {needsVariant
            ? "Choose options"
            : soldOut
              ? "Sold out"
              : remaining === 0
                ? "Limit reached"
                : "Add to cart"}
        </Button>
      </div>
      {hydrated &&
        variant &&
        !soldOut &&
        stock <= LOW_STOCK_THRESHOLD &&
        inCart === 0 && (
          <FieldDescription>
            Only {stock} left in {variant.title}
          </FieldDescription>
        )}
      {hydrated && inCart > 0 && (
        <FieldDescription>
          {inCart} already in your cart
          {remaining === 0 && ` — that’s the most we can sell per order.`}
        </FieldDescription>
      )}
    </form>
  );
}

export { AddToCartForm };
