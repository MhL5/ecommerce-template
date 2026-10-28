import { AccountAddresses } from "@/features/addresses/components/AccountAddresses";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Addresses" };

export default function AccountAddressesPage() {
  return <AccountAddresses />;
}
