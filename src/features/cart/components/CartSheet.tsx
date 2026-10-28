"use client";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Link } from "@/components/ui/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
import { lineKeyOf } from "@/features/cart/api/cart-store";
import { CartCountBadge } from "@/features/cart/components/CartCountBadge";
import { CartLineItem } from "@/features/cart/components/CartLineItem";
import { useCart } from "@/features/cart/hooks/use-cart";
import { formatPrice, pluralize } from "@/lib/format";
import { ShoppingBag02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { usePathname } from "next/navigation";
import { useState } from "react";

/** Header cart button that opens a mini cart in a side sheet. */
function CartSheet() {
  const { items, count, subtotal } = useCart();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [openedOn, setOpenedOn] = useState(pathname);

  // Close when a link inside the sheet navigates somewhere else.
  if (pathname !== openedOn) {
    setOpenedOn(pathname);
    if (open) setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={count ? `Open cart, ${count} items` : "Open cart"}
          />
        }
      >
        <HugeiconsIcon icon={ShoppingBag02Icon} strokeWidth={2} />
        <CartCountBadge count={count} />
      </SheetTrigger>

      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>Your cart</SheetTitle>
          <SheetDescription>
            {count ? pluralize(count, "item") : "Nothing here yet"}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <Empty className="flex-1">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={ShoppingBag02Icon} strokeWidth={2} />
              </EmptyMedia>
              <EmptyTitle>Your cart is empty</EmptyTitle>
              <EmptyDescription>
                Browse the shop and add something you like.
              </EmptyDescription>
            </EmptyHeader>
            <SheetClose
              nativeButton={false}
              render={
                <Button
                  nativeButton={false}
                  render={<Link href="/products" />}
                />
              }
            >
              Start shopping
            </SheetClose>
          </Empty>
        ) : (
          <>
            <ScrollArea className="min-h-0 flex-1">
              <ul className="flex flex-col gap-4 p-4">
                {items.map((item, index) => (
                  <li key={lineKeyOf(item)} className="flex flex-col gap-4">
                    {index > 0 && <Separator />}
                    <CartLineItem item={item} size="sm" />
                  </li>
                ))}
              </ul>
            </ScrollArea>
            <SheetFooter className="border-t">
              <div className="flex items-center justify-between font-medium">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Shipping and tax are calculated at checkout.
              </p>
              <Button
                size="lg"
                nativeButton={false}
                render={<Link href="/checkout" />}
              >
                Checkout
              </Button>
              <Button
                variant="outline"
                size="lg"
                nativeButton={false}
                render={<Link href="/cart" />}
              >
                View cart
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export { CartSheet };
