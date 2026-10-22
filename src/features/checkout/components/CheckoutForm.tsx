"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "@/features/auth/hooks/use-session";
import { clearCart } from "@/features/cart/api/cart-store";
import { CartViewSkeleton } from "@/features/cart/components/CartViewSkeleton";
import { EmptyCart } from "@/features/cart/components/EmptyCart";
import { useCart } from "@/features/cart/hooks/use-cart";
import {
  type Discount,
  FREE_SHIPPING_THRESHOLD,
  type ShippingMethodId,
  computeTotals,
} from "@/features/cart/utils/totals";
import {
  AddressFields,
  ContactFields,
} from "@/features/checkout/components/AddressFields";
import { CheckoutSummary } from "@/features/checkout/components/CheckoutSummary";
import { PaymentFields } from "@/features/checkout/components/PaymentFields";
import { ShippingMethodField } from "@/features/checkout/components/ShippingMethodField";
import {
  type CheckoutErrors,
  type CheckoutValues,
  validateCheckout,
} from "@/features/checkout/utils/schema";
import { createOrder } from "@/features/orders/api/order-store";
import { formatPrice } from "@/lib/format";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

function formValues(form: HTMLFormElement) {
  return Object.fromEntries(
    [...new FormData(form).entries()].map(([key, value]) => [
      key,
      typeof value === "string" ? value : "",
    ]),
  );
}

function PlacingOrder() {
  return (
    <Empty className="py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Spinner />
        </EmptyMedia>
        <EmptyTitle>Order placed</EmptyTitle>
        <EmptyDescription>Taking you to your confirmation…</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function CheckoutForm() {
  const { items, subtotal, hydrated } = useCart();
  const { user } = useSession();
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethodId>("standard");
  const formRef = useRef<HTMLFormElement>(null);
  const [placing, setPlacing] = useState(false);
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const router = useRouter();

  if (!hydrated) return <CartViewSkeleton />;
  // The cart empties right after an order is placed; don’t flash "empty".
  if (placedOrderId) return <PlacingOrder />;
  if (items.length === 0) return <EmptyCart />;

  // A code can stop qualifying when the cart changes (e.g. SAVE20's minimum).
  const activeDiscount =
    discount && subtotal >= (discount.minSubtotal ?? 0) ? discount : null;
  const totals = computeTotals(subtotal, shippingMethod, activeDiscount);
  const [firstName = "", ...rest] = (user?.name ?? "").split(" ");
  const defaults = user
    ? { email: user.email, firstName, lastName: rest.join(" ") }
    : {};

  // After the first submit, re-validate as the user fixes fields.
  function revalidate() {
    if (!submitted || !formRef.current) return;
    const result = validateCheckout(formValues(formRef.current));
    setErrors(result.success ? {} : result.errors);
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    const form = event.currentTarget;
    const result = validateCheckout(formValues(form));
    if (!result.success) {
      setErrors(result.errors);
      // Move focus to the first problem once the error state has rendered.
      requestAnimationFrame(() => {
        form.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
      });
      return;
    }
    setErrors({});
    void placeOrder(result.data);
  }

  async function placeOrder(values: CheckoutValues) {
    setPlacing(true);
    // Pretend to talk to a payment provider.
    await new Promise((resolve) => setTimeout(resolve, 900));

    const order = createOrder({
      items,
      email: values.email,
      userId: user?.id ?? null,
      shippingMethod: values.shippingMethod,
      cardNumber: values.cardNumber,
      discount: activeDiscount,
      shippingAddress: {
        firstName: values.firstName,
        lastName: values.lastName,
        address1: values.address1,
        address2: values.address2,
        city: values.city,
        region: values.region,
        postalCode: values.postalCode,
        country: values.country,
        phone: values.phone,
      },
    });

    setPlacedOrderId(order.id);
    clearCart();
    router.replace(`/checkout/success?order=${order.id}` as Route);
  }

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={onSubmit}
      onChange={revalidate}
      className="grid items-start gap-8 lg:grid-cols-[1fr_24rem]"
    >
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
            <CardDescription>
              How we’ll reach you about this order.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContactFields errors={errors} defaults={defaults} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Shipping address</CardTitle>
            <CardDescription>Where should we send it?</CardDescription>
          </CardHeader>
          <CardContent>
            <AddressFields errors={errors} defaults={defaults} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Delivery</CardTitle>
            <CardDescription>
              Standard shipping is free on orders over{" "}
              {formatPrice(FREE_SHIPPING_THRESHOLD)}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ShippingMethodField
              value={shippingMethod}
              onChange={setShippingMethod}
              subtotal={subtotal}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
            <CardDescription>
              Card details are checked locally and never stored.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentFields errors={errors} onFilled={revalidate} />
          </CardContent>
        </Card>
      </div>
      <CheckoutSummary
        items={items}
        totals={totals}
        discount={activeDiscount}
        onDiscountChange={setDiscount}
        shippingMethod={shippingMethod}
        placing={placing}
      />
    </form>
  );
}

export { CheckoutForm };
