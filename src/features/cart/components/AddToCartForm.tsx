"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { addToCart, maxQuantityFor } from "@/features/cart/api/cart-store";
import { QuantitySelector } from "@/features/cart/components/QuantitySelector";
import { useCartQuantity } from "@/features/cart/hooks/use-cart";
import type { Product } from "@/features/products/types";
import { useHydrated } from "@/hooks/use-hydrated";
import { ShoppingBagAddIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

function AddToCartForm({ product }: { product: Product }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const inCart = useCartQuantity(product.id);
  const [quantity, setQuantity] = useState(1);
  const quantityId = useId();

  const maxForLine = maxQuantityFor(product.id);
  const remaining = Math.max(0, maxForLine - inCart);
  const soldOut = product.stock <= 0;
  const disabled = !hydrated || soldOut || remaining === 0;
  const selected = Math.min(quantity, Math.max(1, remaining));

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const added = addToCart(product.id, selected);
    if (added === 0) return;

    setQuantity(1);
    toast.add({
      type: "success",
      title: "Added to cart",
      description: `${added} × ${product.name}`,
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
          {soldOut
            ? "Sold out"
            : remaining === 0
              ? "Limit reached"
              : "Add to cart"}
        </Button>
      </div>
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
