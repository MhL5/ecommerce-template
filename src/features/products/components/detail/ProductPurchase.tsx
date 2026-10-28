"use client";

import { AddToCartForm } from "@/features/cart/components/AddToCartForm";
import { VariantPicker } from "@/features/products/components/detail/VariantPicker";
import type { Product, ProductVariant } from "@/features/products/types";
import { findVariant, hasVariants } from "@/features/products/utils/product";
import { useHydrated } from "@/hooks/use-hydrated";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

/**
 * Variant picker + add to cart. The chosen variant lives in `?variant=` so
 * cart links and shared URLs open the same option; it's written with
 * `history.replaceState`, which Next keeps in sync with `useSearchParams`.
 */
function VariantPurchase({
  product,
  options,
  variants,
}: {
  product: Product;
  options: NonNullable<Product["options"]>;
  variants: ProductVariant[];
}) {
  const hydrated = useHydrated();
  const searchParams = useSearchParams();
  const selected =
    findVariant(product, searchParams.get("variant") ?? undefined) ??
    variants.find((variant) => variant.stock > 0) ??
    variants[0]!;

  function select(variant: ProductVariant) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("variant", variant.id);
    window.history.replaceState(null, "", `?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-5">
      <VariantPicker
        options={options}
        variants={variants}
        selected={selected}
        onSelect={select}
        disabled={!hydrated}
      />
      <AddToCartForm product={product} variant={selected} />
    </div>
  );
}

/**
 * Purchase controls for the product page. Products with options read the URL,
 * so that part renders in the browser (Suspense) while the page around it
 * stays prerendered.
 */
function ProductPurchase({ product }: { product: Product }) {
  if (!hasVariants(product)) return <AddToCartForm product={product} />;

  return (
    <Suspense fallback={<AddToCartForm product={product} />}>
      <VariantPurchase
        product={product}
        options={product.options}
        variants={product.variants}
      />
    </Suspense>
  );
}

export { ProductPurchase };
