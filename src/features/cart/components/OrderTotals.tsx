import { Separator } from "@/components/ui/separator";
import type { CartTotals } from "@/features/cart/utils/totals";
import { TAX_RATE } from "@/features/cart/utils/totals";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

function Row({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

/** Subtotal / shipping / tax / total breakdown shared by cart, checkout and orders. */
function OrderTotals({
  totals,
  shippingLabel = "Shipping",
  discountCode,
  className,
}: {
  totals: Pick<CartTotals, "subtotal" | "shipping" | "tax" | "total"> & {
    discount?: number;
  };
  shippingLabel?: string;
  /** Shown next to the discount row, e.g. `WELCOME10`. */
  discountCode?: string;
  className?: string;
}) {
  const discount = totals.discount ?? 0;

  return (
    <dl className={cn("flex flex-col gap-2 text-sm", className)}>
      <Row label="Subtotal" value={formatPrice(totals.subtotal)} />
      {discount > 0 && (
        <Row
          label={discountCode ? `Discount (${discountCode})` : "Discount"}
          value={`−${formatPrice(discount)}`}
        />
      )}
      <Row
        label={shippingLabel}
        value={totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}
      />
      <Row
        label={`Tax (${Math.round(TAX_RATE * 100)}%)`}
        value={formatPrice(totals.tax)}
      />
      <Separator className="my-1" />
      <div className="flex items-center justify-between gap-4 text-base font-semibold">
        <dt>Total</dt>
        <dd className="tabular-nums">{formatPrice(totals.total)}</dd>
      </div>
    </dl>
  );
}

export { OrderTotals };
