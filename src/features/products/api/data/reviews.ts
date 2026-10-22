import type { Product, Review } from "@/features/products/types";

const authors = [
  "Maya R.",
  "Jonas K.",
  "Priya S.",
  "Tom W.",
  "Lea M.",
  "Daniel O.",
  "Sofia G.",
  "Arash N.",
  "Hannah B.",
  "Kenji T.",
];

const positive = [
  {
    title: "Exactly what I hoped for",
    body: "Quality feels a step above the price. I've used it daily for a few weeks and it still looks new.",
  },
  {
    title: "Would buy again",
    body: "Arrived quickly and well packaged. It does what it says, and the finish is lovely in person.",
  },
  {
    title: "Great everyday pick",
    body: "Simple, well made and comfortable to use. My partner has already asked for one too.",
  },
  {
    title: "Better than expected",
    body: "I was on the fence, but the details are thoughtful and it has held up well so far.",
  },
];

const mixed = [
  {
    title: "Good, with one caveat",
    body: "Overall I'm happy with it. It runs a little differently than I expected, so check the specs first.",
  },
  {
    title: "Solid, not perfect",
    body: "Does the job well. I'd have liked more colour options, but the build quality is good.",
  },
];

/** Deterministic mock reviews: same product always yields the same reviews. */
function buildReviews(product: Product): Review[] {
  // Products added through the admin start with no reviews.
  if (product.reviewCount === 0) return [];
  const seed = Number(product.id.replace(/\D/g, "")) || 1;
  const count = 3 + (seed % 3);

  return Array.from({ length: count }, (_, index) => {
    const n = seed + index * 7;
    const isMixed = index === count - 1 && product.rating < 4.6;
    const pool = isMixed ? mixed : positive;
    const copy = pool[n % pool.length]!;
    const day = 1 + ((n * 3) % 27);
    const month = 1 + ((seed + index) % 9);

    return {
      id: `${product.id}-r${index + 1}`,
      author: authors[n % authors.length]!,
      rating: isMixed ? 3 + (n % 2) : 4 + (n % 3 === 0 ? 0 : 1),
      title: copy.title,
      body: copy.body,
      date: `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T12:00:00.000Z`,
    };
  });
}

export { buildReviews };
