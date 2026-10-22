import { CartView } from "@/features/cart/components/CartView";
import { PageContainer } from "@/features/layout/components/PageContainer";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Your cart" };

export default function CartPage() {
  return (
    <PageContainer className="flex flex-col gap-8 py-8 sm:py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Your cart</h1>
      <CartView />
    </PageContainer>
  );
}
