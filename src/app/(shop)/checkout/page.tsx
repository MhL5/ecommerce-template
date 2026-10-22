import { CheckoutForm } from "@/features/checkout/components/CheckoutForm";
import { PageContainer } from "@/features/layout/components/PageContainer";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <PageContainer className="flex flex-col gap-8 py-8 sm:py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
        <p className="text-muted-foreground">
          This is a demo — no real payment is taken and nothing ships.
        </p>
      </header>
      <CheckoutForm />
    </PageContainer>
  );
}
