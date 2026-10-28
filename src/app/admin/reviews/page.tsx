import { AdminReviews } from "@/features/admin/components/reviews/AdminReviews";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reviews" };

export default function AdminReviewsPage() {
  return <AdminReviews />;
}
