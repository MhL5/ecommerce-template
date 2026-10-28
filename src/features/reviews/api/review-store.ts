import { seedReviews } from "@/features/reviews/api/data/seed-reviews";
import type {
  CustomerReview,
  ReviewInput,
  ReviewStatus,
} from "@/features/reviews/types";
import { createLocalStore } from "@/lib/createLocalStore";
import { z } from "zod";

/** All customer reviews once anything changed; `null` means the seed list. */
const reviewStore = createLocalStore<{ reviews: CustomerReview[] | null }>(
  "northstar:reviews",
  { reviews: null },
  z.object({
    reviews: z
      .array(
        z.object({
          id: z.string(),
          productId: z.string(),
          userId: z.string(),
          author: z.string(),
          rating: z.number(),
          title: z.string(),
          body: z.string(),
          date: z.string(),
          status: z.enum(["pending", "published", "rejected"]),
          isVerifiedPurchase: z.boolean(),
        }),
      )
      .nullable(),
  }),
);

function getReviews() {
  return reviewStore.getState().reviews ?? seedReviews;
}

function useCustomerReviews() {
  return reviewStore.useStore().reviews ?? seedReviews;
}

type SubmitReviewInput = ReviewInput & {
  productId: string;
  userId: string;
  author: string;
  isVerifiedPurchase: boolean;
};

/**
 * Saves a shopper's review for moderation, replacing any earlier review of
 * the same product (one per user per product).
 */
function submitReview(input: SubmitReviewInput) {
  const review: CustomerReview = {
    ...input,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    status: "pending",
  };
  reviewStore.setState({
    reviews: [
      review,
      ...getReviews().filter(
        (entry) =>
          !(
            entry.productId === input.productId && entry.userId === input.userId
          ),
      ),
    ],
  });
  return review;
}

function setReviewStatus(id: string, status: ReviewStatus) {
  reviewStore.setState({
    reviews: getReviews().map((entry) =>
      entry.id === id ? { ...entry, status } : entry,
    ),
  });
}

function deleteReview(id: string) {
  reviewStore.setState({
    reviews: getReviews().filter((entry) => entry.id !== id),
  });
}

export {
  deleteReview,
  getReviews,
  setReviewStatus,
  submitReview,
  useCustomerReviews,
  type SubmitReviewInput,
};
