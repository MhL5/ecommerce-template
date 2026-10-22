import { AccountOverview } from "@/features/account/components/AccountOverview";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My account" };

export default function AccountPage() {
  return <AccountOverview />;
}
