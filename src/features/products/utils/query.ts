import type {
  CategoryId,
  Product,
  ProductQuery,
  ProductQueryResult,
  ProductSort,
} from "@/features/products/types";
import { isOnSale } from "@/features/products/utils/product";
import type { Route } from "next";

const PAGE_SIZE = 12;

const CATEGORY_IDS: CategoryId[] = [
  "electronics",
  "clothing",
  "home-kitchen",
  "sports-outdoors",
  "beauty",
  "accessories",
];

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "name", label: "Name: A–Z" },
];

const DEFAULT_QUERY: ProductQuery = {
  q: "",
  categories: [],
  brands: [],
  minPrice: null,
  maxPrice: null,
  minRating: null,
  inStock: false,
  onSale: false,
  sort: "featured",
  page: 1,
};

type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function list(value: string | string[] | undefined) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return values
    .flatMap((entry) => entry.split(","))
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function positiveNumber(value: string | undefined) {
  if (value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function isCategoryId(value: string): value is CategoryId {
  return (CATEGORY_IDS as string[]).includes(value);
}

function isSort(value: string | undefined): value is ProductSort {
  return SORT_OPTIONS.some((option) => option.value === value);
}

/**
 * Reads the listing URL params. Prices travel in whole dollars (`min=20`)
 * and are converted to cents here.
 */
function parseProductQuery(params: RawSearchParams): ProductQuery {
  const sort = first(params["sort"]);
  const min = positiveNumber(first(params["min"]));
  const max = positiveNumber(first(params["max"]));
  const rating = positiveNumber(first(params["rating"]));
  const page = Math.floor(positiveNumber(first(params["page"])) ?? 1);

  return {
    q: (first(params["q"]) ?? "").trim(),
    categories: list(params["category"]).filter(isCategoryId),
    brands: list(params["brand"]),
    minPrice: min === null ? null : Math.round(min * 100),
    maxPrice: max === null ? null : Math.round(max * 100),
    minRating: rating === null ? null : Math.min(rating, 5),
    inStock: first(params["stock"]) === "1",
    onSale: first(params["sale"]) === "1",
    sort: isSort(sort) ? sort : "featured",
    page: Math.max(1, page),
  };
}

/** Inverse of `parseProductQuery`; omits defaults to keep URLs short. */
function serializeProductQuery(query: Partial<ProductQuery>) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.categories?.length)
    params.set("category", query.categories.join(","));
  if (query.brands?.length) params.set("brand", query.brands.join(","));
  if (query.minPrice != null)
    params.set("min", String(Math.floor(query.minPrice / 100)));
  if (query.maxPrice != null)
    params.set("max", String(Math.ceil(query.maxPrice / 100)));
  if (query.minRating != null) params.set("rating", String(query.minRating));
  if (query.inStock) params.set("stock", "1");
  if (query.onSale) params.set("sale", "1");
  if (query.sort && query.sort !== "featured") params.set("sort", query.sort);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  return params.toString();
}

function productsHref(query: Partial<ProductQuery> = {}): Route {
  const search = serializeProductQuery(query);
  return (search ? `/products?${search}` : "/products") as Route;
}

function matchesSearch(product: Product, q: string) {
  if (!q) return true;
  const haystack = [
    product.name,
    product.brand,
    product.description,
    product.categoryId,
    ...product.tags,
  ]
    .join(" ")
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

function filterProducts(products: Product[], query: ProductQuery) {
  return products.filter((product) => {
    if (!matchesSearch(product, query.q)) return false;
    if (
      query.categories.length &&
      !query.categories.includes(product.categoryId)
    )
      return false;
    if (query.brands.length && !query.brands.includes(product.brand))
      return false;
    if (query.minPrice !== null && product.price < query.minPrice) return false;
    if (query.maxPrice !== null && product.price > query.maxPrice) return false;
    if (query.minRating !== null && product.rating < query.minRating)
      return false;
    if (query.inStock && product.stock <= 0) return false;
    if (query.onSale && !isOnSale(product)) return false;
    return true;
  });
}

function sortProducts(products: Product[], sort: ProductSort) {
  const sorted = [...products];
  switch (sort) {
    case "newest":
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "rating":
      return sorted.sort(
        (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
      );
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "featured":
      return sorted.sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          Number(b.stock > 0) - Number(a.stock > 0) ||
          b.reviewCount - a.reviewCount,
      );
  }
}

function paginate<T>(items: T[], page: number, pageSize = PAGE_SIZE) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);
  const start = (current - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: current,
    pageCount,
    pageSize,
  };
}

function runProductQuery(
  products: Product[],
  query: ProductQuery,
): ProductQueryResult {
  const filtered = sortProducts(filterProducts(products, query), query.sort);
  return { ...paginate(filtered, query.page), total: filtered.length };
}

/**
 * Counts per category and brand. Each facet ignores its own selection so the
 * numbers show what you'd get by toggling that option.
 */
function getFacetCounts(products: Product[], query: ProductQuery) {
  const categories = new Map<CategoryId, number>();
  const brands = new Map<string, number>();

  for (const product of filterProducts(products, {
    ...query,
    categories: [],
  })) {
    categories.set(
      product.categoryId,
      (categories.get(product.categoryId) ?? 0) + 1,
    );
  }
  for (const product of filterProducts(products, { ...query, brands: [] })) {
    brands.set(product.brand, (brands.get(product.brand) ?? 0) + 1);
  }

  return { categories, brands };
}

function countActiveFilters(query: ProductQuery) {
  return (
    query.categories.length +
    query.brands.length +
    Number(query.minPrice !== null || query.maxPrice !== null) +
    Number(query.minRating !== null) +
    Number(query.inStock) +
    Number(query.onSale)
  );
}

export {
  CATEGORY_IDS,
  countActiveFilters,
  DEFAULT_QUERY,
  filterProducts,
  getFacetCounts,
  isCategoryId,
  PAGE_SIZE,
  paginate,
  parseProductQuery,
  productsHref,
  runProductQuery,
  serializeProductQuery,
  SORT_OPTIONS,
  sortProducts,
  type RawSearchParams,
};
