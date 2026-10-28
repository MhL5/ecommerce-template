import { Img } from "@/components/ui/Img";
import { Link } from "@/components/ui/link";
import { Separator } from "@/components/ui/separator";
import { AddressLines } from "@/features/addresses/components/AddressLines";
import { OrderTotals } from "@/features/cart/components/OrderTotals";
import { getShippingMethod } from "@/features/cart/utils/totals";
import { OrderTimeline } from "@/features/orders/components/OrderTimeline";
import type { Order } from "@/features/orders/types";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

function InfoBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

/** Items, totals, address, delivery and payment for one order. */
function OrderDetails({
  order,
  className,
}: {
  order: Order;
  className?: string;
}) {
  const shipping = getShippingMethod(order.shippingMethod);

  return (
    <div className={cn("@container flex flex-col gap-6", className)}>
      <OrderTimeline order={order} />

      <Separator />

      <ul className="flex flex-col gap-4">
        {order.items.map((item) => (
          <li
            key={`${item.productId}:${item.variantId ?? ""}`}
            className="flex items-center gap-4"
          >
            <span className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10">
              {item.image && (
                <Img
                  src={item.image}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              )}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <Link
                href={
                  item.variantId
                    ? `/products/${item.slug}?variant=${item.variantId}`
                    : `/products/${item.slug}`
                }
                className="truncate rounded-sm font-medium outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {item.name}
              </Link>
              {item.variantTitle && (
                <span className="text-xs">{item.variantTitle}</span>
              )}
              <span className="text-xs text-muted-foreground">
                {item.brand} · {item.quantity} × {formatPrice(item.price)}
              </span>
            </span>
            <span className="text-sm font-medium tabular-nums">
              {formatPrice(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <Separator />

      <div className="grid gap-6 @md:grid-cols-2 @3xl:grid-cols-[1fr_1fr_1.2fr]">
        <InfoBlock title="Shipping to">
          <AddressLines address={order.shippingAddress} />
        </InfoBlock>
        <div className="flex flex-col gap-4">
          <InfoBlock title="Delivery">
            <span className="block">
              {shipping.label} · {shipping.description}
            </span>
          </InfoBlock>
          <InfoBlock title="Payment">
            <span className="block">
              {order.payment.brand} ending in {order.payment.last4}
            </span>
            <span className="block text-xs text-muted-foreground">
              Test payment — nothing was charged.
            </span>
          </InfoBlock>
        </div>
        <OrderTotals
          totals={order.totals}
          discountCode={order.discountCode}
          shippingLabel={`Shipping (${shipping.label.toLowerCase()})`}
          className="@md:col-span-2 @3xl:col-span-1"
        />
      </div>
    </div>
  );
}

export { OrderDetails };
