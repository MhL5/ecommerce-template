import { AdminSkeleton } from "@/features/admin/components/AdminSkeleton";
import { AdminOrders } from "@/features/admin/components/orders/AdminOrders";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Orders" };

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <AdminOrders />
    </Suspense>
  );
}
