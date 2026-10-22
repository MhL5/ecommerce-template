import { getCategoryById } from "@/features/products/api";
import type { ProductQuery } from "@/features/products/types";

const DEFAULT_HEADING = {
  title: "Shop",
  description:
    "Everything in the catalogue — search, filter and sort to find your next favourite.",
};

/** Heading for the current view: one category, a search, deals, or all. */
function getListingHeading(query?: ProductQuery) {
  if (!query) return DEFAULT_HEADING;

  const [onlyCategory] = query.categories;
  const category =
    query.categories.length === 1 && onlyCategory
      ? getCategoryById(onlyCategory)
      : undefined;

  if (query.q) {
    return {
      title: `Results for “${query.q}”`,
      description: category
        ? `Searching in ${category.name}.`
        : "Searching the whole catalogue.",
    };
  }
  if (category) {
    return { title: category.name, description: category.description };
  }
  if (query.onSale) {
    return {
      title: "Deals",
      description: "Reduced prices on selected favourites, while stock lasts.",
    };
  }
  if (query.sort === "newest" && query.categories.length === 0) {
    return {
      title: "New in",
      description: "The latest additions to the shop.",
    };
  }
  return DEFAULT_HEADING;
}

function ListingHeader({ query }: { query?: ProductQuery }) {
  const heading = getListingHeading(query);

  return (
    <header className="flex flex-col gap-1">
      <h1 className="text-3xl font-semibold tracking-tight text-balance">
        {heading.title}
      </h1>
      <p className="text-muted-foreground">{heading.description}</p>
    </header>
  );
}

export { getListingHeading, ListingHeader };
