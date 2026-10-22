import { categories } from "@/features/products/api/data/categories";
import { products } from "@/features/products/api/data/products";
import { buildReviews } from "@/features/products/api/data/reviews";
import type {
  Category,
  CategoryId,
  Product,
  ProductQuery,
} from "@/features/products/types";
import {
  getFacetCounts,
  runProductQuery,
} from "@/features/products/utils/query";

/*
 * Mock catalog API. Everything reads from the static data files, so these
 * calls are synchronous and safe to use from server and client components.
 * Functions that scan the catalogue take an optional product list so client
 * code can pass the merged catalogue (base data + admin overrides, see
 * `catalog-store.ts`); the server always uses the base data.
 */

function getProducts(): Product[] {
  return products;
}

function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

function getProductById(id: string) {
  return products.find((product) => product.id === id);
}

function getFeaturedProducts(limit = 8) {
  return products.filter((product) => product.featured).slice(0, limit);
}

function getNewArrivals(limit = 8) {
  return [...products]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

function getDeals(limit = 8) {
  return products
    .filter(
      (product) => product.compareAtPrice !== undefined && product.stock > 0,
    )
    .slice(0, limit);
}

/** Same category first, then products sharing a tag. */
function getRelatedProducts(
  product: Product,
  limit = 4,
  catalog: Product[] = products,
) {
  const others = catalog.filter((other) => other.id !== product.id);
  const sameCategory = others.filter(
    (other) => other.categoryId === product.categoryId,
  );
  const sharedTag = others.filter(
    (other) =>
      other.categoryId !== product.categoryId &&
      other.tags.some((tag) => product.tags.includes(tag)),
  );
  return [...sameCategory, ...sharedTag].slice(0, limit);
}

function getCategories(): Category[] {
  return categories;
}

function getCategoryById(id: CategoryId) {
  return categories.find((category) => category.id === id);
}

function getCategoryProductCounts(catalog: Product[] = products) {
  const counts = new Map<CategoryId, number>();
  for (const product of catalog) {
    counts.set(product.categoryId, (counts.get(product.categoryId) ?? 0) + 1);
  }
  return counts;
}

function getBrands(catalog: Product[] = products) {
  return [...new Set(catalog.map((product) => product.brand))].sort();
}

/** Cheapest and most expensive prices in cents. */
function getPriceBounds(catalog: Product[] = products) {
  const prices = catalog.map((product) => product.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

function getProductReviews(product: Product) {
  return buildReviews(product);
}

function getProductFacets(query: ProductQuery, catalog: Product[] = products) {
  return getFacetCounts(catalog, query);
}

function queryProducts(query: ProductQuery, catalog: Product[] = products) {
  return runProductQuery(catalog, query);
}

export {
  getBrands,
  getCategories,
  getCategoryById,
  getCategoryProductCounts,
  getDeals,
  getFeaturedProducts,
  getNewArrivals,
  getPriceBounds,
  getProductFacets,
  getProductById,
  getProductBySlug,
  getProductReviews,
  getProducts,
  getRelatedProducts,
  queryProducts,
};
