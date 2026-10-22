"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { CartCountBadge } from "@/features/cart/components/CartCountBadge";
import { useWishlist } from "@/features/wishlist/hooks/use-wishlist";
import { FavouriteIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

function WishlistHeaderButton() {
  const { count, hydrated } = useWishlist();
  const shown = hydrated ? count : 0;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      aria-label={shown ? `Wishlist, ${shown} saved` : "Wishlist"}
      nativeButton={false}
      render={<Link href="/wishlist" />}
    >
      <HugeiconsIcon icon={FavouriteIcon} strokeWidth={2} />
      <CartCountBadge count={shown} />
    </Button>
  );
}

export { WishlistHeaderButton };
