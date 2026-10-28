import { AdminDiscounts } from "@/features/admin/components/discounts/AdminDiscounts";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Discounts" };

export default function AdminDiscountsPage() {
  return <AdminDiscounts />;
}
