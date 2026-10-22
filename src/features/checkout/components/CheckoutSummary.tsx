import { Img } from "@/components/ui/Img";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/components/ui/link";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { OrderTotals } from "@/features/cart/components/OrderTotals";
import type { CartItem } from "@/features/cart/types";
import {
  type CartTotals,
  type Discount,
  type ShippingMethodId,
  getShippingMethod,
} from "@/features/cart/utils/totals";
import { DiscountCodeField } from "@/features/checkout/components/DiscountCodeField";
import { formatPrice } from "@/lib/format";
import { SecurityCheckIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

type CheckoutSummaryProps = {
  items: CartItem[];
  totals: CartTotals;
  shippingMethod: ShippingMethodId;
  discount: Discount | null;
  onDiscountChange: (discount: Discount | null) => void;
  placing: boolean;
};

function CheckoutSummary({
  items,
  totals,
  shippingMethod,
  discount,
  onDiscountChange,
  placing,
}: CheckoutSummaryProps) {
  return (
    <Card className="lg:sticky lg:top-24">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Order summary</CardTitle>
        <Button
          variant="link"
          size="sm"
          className="h-auto px-0"
          nativeButton={false}
          render={<Link href="/cart" />}
        >
          Edit cart
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.productId} className="flex items-center gap-3">
              <span className="relative size-14 shrink-0 rounded-lg bg-muted ring-1 ring-foreground/10">
                <Img
                  src={item.product.images[0] ?? ""}
                  alt=""
                  fill
                  sizes="56px"
                  className="rounded-lg object-cover"
                />
                <Badge
                  variant="secondary"
                  className="absolute -end-2 -top-2 min-w-5 tabular-nums"
                >
                  {item.quantity}
                </Badge>
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">
                  {item.product.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatPrice(item.product.price)} each
                </span>
              </span>
              <span className="text-sm tabular-nums">
                {formatPrice(item.lineTotal)}
              </span>
            </li>
          ))}
        </ul>
        <Separator />
        <DiscountCodeField
          applied={discount}
          subtotal={totals.subtotal}
          onApply={onDiscountChange}
        />
        <Separator />
        <OrderTotals
          totals={totals}
          discountCode={discount?.code}
          shippingLabel={`Shipping (${getShippingMethod(shippingMethod).label.toLowerCase()})`}
        />
      </CardContent>
      <CardFooter className="flex-col gap-3">
        <Button type="submit" size="lg" className="w-full" disabled={placing}>
          {placing && <Spinner data-icon="inline-start" />}
          {placing
            ? "Placing order…"
            : `Place order · ${formatPrice(totals.total)}`}
        </Button>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <HugeiconsIcon
            icon={SecurityCheckIcon}
            strokeWidth={2}
            className="size-3.5"
          />
          Demo checkout — you won’t be charged.
        </p>
      </CardFooter>
    </Card>
  );
}

export { CheckoutSummary };
