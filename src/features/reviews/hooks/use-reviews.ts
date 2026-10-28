import { getProductReviews } from "@/features/products/api";
import type { Product, Review } from "@/features/products/types";
import { useCustomerReviews } from "@/features/reviews/api/review-store";
import type { CustomerReview } from "@/features/reviews/types";

type ListedReview = Review & { isVerifiedPurchase: boolean };

type ProductReviewSummary = {
  /** Published reviews, newest first. */
  reviews: ListedReview[];
  /** Average including published customer reviews. */
  rating: number;
  reviewCount: number;
};

/**
 * The catalogue's generated reviews plus published customer reviews. The
 * product's rating and count are an aggregate over many more reviews than
 * are listed, so customer reviews are folded into that aggregate.
 */
function useProductReviews(product: Product): ProductReviewSummary {
  const customer = useCustomerReviews().filter(
    (review) =>
      review.productId === product.id && review.status === "published",
  );
  const generated = getProductReviews(product).map((review) => ({
    ...review,
    isVerifiedPurchase: true,
  }));

  const reviewCount = product.reviewCount + customer.length;
  const ratingSum =
    product.rating * product.reviewCount +
    customer.reduce((sum, review) => sum + review.rating, 0);

  return {
    reviews: [...customer, ...generated].sort((a, b) =>
      b.date.localeCompare(a.date),
    ),
    rating: reviewCount ? ratingSum / reviewCount : 0,
    reviewCount,
  };
}

/** The signed-in user's review of a product, in any status. */
function useOwnReview(
  productId: string,
  userId: string | undefined,
): CustomerReview | undefined {
  const reviews = useCustomerReviews();
  if (!userId) return undefined;
  return reviews.find(
    (review) => review.productId === productId && review.userId === userId,
  );
}

export {
  useOwnReview,
  useProductReviews,
  type ListedReview,
  type ProductReviewSummary,
};
