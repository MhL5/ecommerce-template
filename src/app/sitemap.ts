import { clientEnv } from "@/env/clientEnv";
import { getCategories, getProducts } from "@/features/products/api";
import { productsHref } from "@/features/products/utils/query";
import type { MetadataRoute } from "next";

const base = clientEnv.NEXT_PUBLIC_FRONTEND_DOMAIN;

/** Public shop pages only; account, checkout and admin are left out. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/products`, changeFrequency: "daily", priority: 0.9 },
    ...getCategories().map((category) => ({
      url: `${base}${productsHref({ categories: [category.id] })}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...getProducts().map((product) => ({
      url: `${base}/products/${product.slug}`,
      // Fixed dates from the mock data keep the file static.
      lastModified: product.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
