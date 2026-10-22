import { AdminDashboard } from "@/features/admin/components/dashboard/AdminDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
