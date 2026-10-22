import { AdminProducts } from "@/features/admin/components/AdminProducts";
import { AdminSkeleton } from "@/features/admin/components/AdminSkeleton";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Products" };

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <AdminProducts />
    </Suspense>
  );
}
