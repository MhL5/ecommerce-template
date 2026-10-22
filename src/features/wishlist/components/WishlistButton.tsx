"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import type { Product } from "@/features/products/types";
import { toggleWishlist } from "@/features/wishlist/api/wishlist-store";
import { useIsWishlisted } from "@/features/wishlist/hooks/use-wishlist";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";
import { FavouriteIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";

type WishlistButtonProps = {
  product: Pick<Product, "id" | "name">;
  /** `overlay`: round icon on a product image; `default`: labelled button. */
  variant?: "overlay" | "default";
  className?: string;
};

function WishlistButton({
  product,
  variant = "default",
  className,
}: WishlistButtonProps) {
  const router = useRouter();
  const hydrated = useHydrated();
  const saved = useIsWishlisted(product.id) && hydrated;

  function onClick() {
    const nowSaved = toggleWishlist(product.id);
    toast.add({
      title: nowSaved ? "Saved to wishlist" : "Removed from wishlist",
      description: product.name,
      actionProps: nowSaved
        ? { children: "View", onClick: () => router.push("/wishlist") }
        : undefined,
    });
  }

  const icon = (
    <HugeiconsIcon
      icon={FavouriteIcon}
      strokeWidth={2}
      // The svg's own fill="none" beats an inherited fill, so set it here.
      className={cn(saved && "fill-current")}
      data-icon={variant === "default" ? "inline-start" : undefined}
    />
  );

  if (variant === "overlay") {
    return (
      <Button
        variant="outline"
        size="icon-sm"
        aria-label={
          saved
            ? `Remove ${product.name} from wishlist`
            : `Save ${product.name} to wishlist`
        }
        aria-pressed={saved}
        disabled={!hydrated}
        onClick={onClick}
        className={cn(
          "rounded-full bg-background/85 backdrop-blur-sm",
          saved && "text-primary",
          className,
        )}
      >
        {icon}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="lg"
      aria-pressed={saved}
      disabled={!hydrated}
      onClick={onClick}
      className={cn("px-4", saved && "text-primary", className)}
    >
      {icon}
      {saved ? "Saved" : "Save to wishlist"}
    </Button>
  );
}

export { WishlistButton };
