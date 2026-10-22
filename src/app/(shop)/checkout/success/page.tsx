import { PageContainer } from "@/features/layout/components/PageContainer";
import {
  OrderConfirmation,
  OrderConfirmationSkeleton,
} from "@/features/orders/components/OrderConfirmation";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false },
};

export default function CheckoutSuccessPage() {
  return (
    <PageContainer className="py-10 sm:py-14">
      <Suspense fallback={<OrderConfirmationSkeleton />}>
        <OrderConfirmation />
      </Suspense>
    </PageContainer>
  );
}
