import { AccountOrders } from "@/features/account/components/AccountOrders";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Order history" };

export default function AccountOrdersPage() {
  return <AccountOrders />;
}
