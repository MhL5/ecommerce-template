import { AdminCustomers } from "@/features/admin/components/customers/AdminCustomers";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Customers" };

export default function AdminCustomersPage() {
  return <AdminCustomers />;
}
