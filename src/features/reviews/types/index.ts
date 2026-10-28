import type { Review } from "@/features/products/types";

type ReviewStatus = "pending" | "published" | "rejected";

/** A review written by a signed-in shopper (mirrors the `review` table). */
type CustomerReview = Review & {
  productId: string;
  userId: string;
  status: ReviewStatus;
  /** The author has a delivered order containing this product. */
  isVerifiedPurchase: boolean;
};

type ReviewInput = Pick<CustomerReview, "rating" | "title" | "body">;

export type { CustomerReview, ReviewInput, ReviewStatus };
