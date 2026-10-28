import type { CustomerReview } from "@/features/reviews/types";

/**
 * Reviews from the demo shoppers, so the admin has something to moderate
 * on a fresh browser. The catalogue's other reviews are generated per
 * product and are always published.
 */
const seedReviews: CustomerReview[] = [
  {
    id: "rev-seed-1",
    productId: "p01",
    userId: "u-c02",
    author: "Priya S.",
    rating: 5,
    title: "Best headphones I’ve owned",
    body: "The noise cancelling is excellent on the train and the battery lasts all week. Comfortable for long calls too.",
    date: "2026-10-18T09:12:00.000Z",
    status: "pending",
    isVerifiedPurchase: true,
  },
  {
    id: "rev-seed-2",
    productId: "p04",
    userId: "u-c05",
    author: "Kwame M.",
    rating: 4,
    title: "Lovely to type on",
    body: "Switches feel great and the build is solid. Docked a star because the companion software is Windows only.",
    date: "2026-10-19T17:40:00.000Z",
    status: "pending",
    isVerifiedPurchase: true,
  },
  {
    id: "rev-seed-3",
    productId: "p02",
    userId: "u-c07",
    author: "Hiro T.",
    rating: 2,
    title: "Strap broke after a month",
    body: "The watch itself is fine but the strap clasp snapped. Support sent a new one, but it shouldn’t happen.",
    date: "2026-10-20T08:05:00.000Z",
    status: "pending",
    isVerifiedPurchase: false,
  },
  {
    id: "rev-seed-4",
    productId: "p03",
    userId: "u-c04",
    author: "Emma L.",
    rating: 5,
    title: "Big sound, tiny speaker",
    body: "Took it camping and it ran for two days straight. Survived a rain shower without complaint.",
    date: "2026-10-12T14:30:00.000Z",
    status: "published",
    isVerifiedPurchase: true,
  },
];

export { seedReviews };
