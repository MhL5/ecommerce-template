"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/components/ui/link";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { clearCart } from "@/features/cart/api/cart-store";
import { CartLineItem } from "@/features/cart/components/CartLineItem";
import { CartViewSkeleton } from "@/features/cart/components/CartViewSkeleton";
import { EmptyCart } from "@/features/cart/components/EmptyCart";
import { OrderTotals } from "@/features/cart/components/OrderTotals";
import { useCart } from "@/features/cart/hooks/use-cart";
import {
  FREE_SHIPPING_THRESHOLD,
  computeTotals,
} from "@/features/cart/utils/totals";
import { formatPrice, pluralize } from "@/lib/format";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

function FreeShippingProgress({ remaining }: { remaining: number }) {
  const value = Math.round(
    ((FREE_SHIPPING_THRESHOLD - remaining) / FREE_SHIPPING_THRESHOLD) * 100,
  );

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm">
        {remaining > 0 ? (
          <>
            Add{" "}
            <span className="font-medium tabular-nums">
              {formatPrice(remaining)}
            </span>{" "}
            more for free standard shipping.
          </>
        ) : (
          "You’ve unlocked free standard shipping."
        )}
      </p>
      <Progress value={value} aria-label="Progress to free shipping" />
    </div>
  );
}

function CartView() {
  const { items, count, subtotal, hydrated } = useCart();

  if (!hydrated) return <CartViewSkeleton />;
  if (items.length === 0) return <EmptyCart />;

  const totals = computeTotals(subtotal);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>{pluralize(count, "item")}</CardTitle>
          <CardDescription>
            Prices include any current discounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-5">
            {items.map((item, index) => (
              <li key={item.productId} className="flex flex-col gap-5">
                {index > 0 && <Separator />}
                <CartLineItem item={item} />
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="justify-between border-t">
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link href="/products" />}
          >
            Continue shopping
          </Button>
          <Button variant="destructive" onClick={() => clearCart()}>
            Clear cart
          </Button>
        </CardFooter>
      </Card>

      <Card className="lg:sticky lg:top-24">
        <CardHeader>
          <CardTitle>Order summary</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <FreeShippingProgress remaining={totals.freeShippingRemaining} />
          <OrderTotals totals={totals} shippingLabel="Shipping (standard)" />
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <Button
            size="lg"
            className="w-full"
            nativeButton={false}
            render={<Link href="/checkout" />}
          >
            Checkout
            <HugeiconsIcon
              icon={ArrowRight02Icon}
              strokeWidth={2}
              data-icon="inline-end"
              className="rtl:rotate-180"
            />
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Demo store — no payment will be taken.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export { CartView };
