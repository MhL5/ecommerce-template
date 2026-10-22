import { categories } from "@/features/products/api/data/categories";
import { products as baseProducts } from "@/features/products/api/data/products";
import type { CategoryId, Product } from "@/features/products/types";
import { createLocalStore } from "@/lib/createLocalStore";
import { z } from "zod";

/*
 * Admin edits to the catalogue, persisted in this browser. The base products
 * in `data/products.ts` never change; the shop and admin read
 * `base + overrides` through `useCatalog()` / `getCatalog()`.
 */

/** Field changes; `compareAtPrice: null` removes the sale price (JSON keeps null, not undefined). */
type ProductPatch = Partial<Omit<Product, "id" | "compareAtPrice">> & {
  compareAtPrice?: number | null;
};

type CatalogOverrides = {
  /** Products added in the admin. */
  created: Product[];
  /** Field changes to base products, by id. */
  updated: Record<string, ProductPatch>;
  /** Base product ids removed in the admin. */
  deleted: string[];
};

const categoryIds = categories.map((category) => category.id) as [
  CategoryId,
  ...CategoryId[],
];

const productSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  brand: z.string(),
  categoryId: z.enum(categoryIds),
  description: z.string(),
  highlights: z.array(z.string()),
  specs: z.array(z.object({ label: z.string(), value: z.string() })),
  price: z.number(),
  compareAtPrice: z.number().optional(),
  rating: z.number(),
  reviewCount: z.number(),
  stock: z.number(),
  images: z.array(z.string()),
  tags: z.array(z.string()),
  featured: z.boolean(),
  createdAt: z.string(),
});

const EMPTY: CatalogOverrides = { created: [], updated: {}, deleted: [] };

const catalogStore = createLocalStore<CatalogOverrides>(
  "northstar:catalog",
  EMPTY,
  z.object({
    created: z.array(productSchema),
    updated: z.record(
      z.string(),
      productSchema
        .omit({ id: true, compareAtPrice: true })
        .partial()
        .extend({ compareAtPrice: z.number().nullable().optional() }),
    ),
    deleted: z.array(z.string()),
  }) as z.ZodType<CatalogOverrides>,
);

function applyPatch(product: Product, patch: ProductPatch): Product {
  const { compareAtPrice, ...rest } = patch;
  const next: Product = { ...product, ...rest };
  if (compareAtPrice === null) delete next.compareAtPrice;
  else if (compareAtPrice !== undefined) next.compareAtPrice = compareAtPrice;
  return next;
}

// Merging is cached per overrides object so hooks get a stable array.
let cache: { overrides: CatalogOverrides; merged: Product[] } | null = null;

function mergeCatalog(overrides: CatalogOverrides): Product[] {
  if (cache?.overrides === overrides) return cache.merged;
  const deleted = new Set(overrides.deleted);
  const merged = [...baseProducts, ...overrides.created]
    .filter((product) => !deleted.has(product.id))
    .map((product) => {
      const patch = overrides.updated[product.id];
      return patch ? applyPatch(product, patch) : product;
    });
  cache = { overrides, merged };
  return merged;
}

/** Current merged catalogue, outside React (event handlers, stores). */
function getCatalog() {
  return mergeCatalog(catalogStore.getState());
}

/** Merged catalogue; equals the base data on the server and during hydration. */
function useCatalog() {
  return mergeCatalog(catalogStore.useStore());
}

/** Whether the admin has changed anything (for "reset catalog"). */
function useCatalogIsModified() {
  const overrides = catalogStore.useStore();
  return (
    overrides.created.length > 0 ||
    overrides.deleted.length > 0 ||
    Object.keys(overrides.updated).length > 0
  );
}

function getCatalogProduct(id: string) {
  return getCatalog().find((product) => product.id === id);
}

function isBaseProduct(id: string) {
  return baseProducts.some((product) => product.id === id);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

/** A slug that no other product (base, created or deleted) uses. */
function uniqueSlug(name: string, exceptId?: string) {
  const taken = new Set(
    [...baseProducts, ...catalogStore.getState().created]
      .filter((product) => product.id !== exceptId)
      .map((product) => product.slug),
  );
  const base = slugify(name) || "product";
  let slug = base;
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
  return slug;
}

type NewProductInput = Pick<
  Product,
  | "name"
  | "brand"
  | "categoryId"
  | "description"
  | "price"
  | "compareAtPrice"
  | "stock"
  | "featured"
  | "tags"
  | "highlights"
>;

function createProduct(input: NewProductInput): Product {
  const category = categories.find((entry) => entry.id === input.categoryId);
  const product: Product = {
    ...input,
    id: `c-${crypto.randomUUID().slice(0, 8)}`,
    slug: uniqueSlug(input.name),
    specs: [],
    rating: 0,
    reviewCount: 0,
    images: [category?.image ?? "/categories/electronics.svg"],
    createdAt: new Date().toISOString(),
  };
  if (product.compareAtPrice === undefined) delete product.compareAtPrice;

  catalogStore.setState((state) => ({
    ...state,
    created: [...state.created, product],
  }));
  return product;
}

function updateProduct(id: string, patch: ProductPatch) {
  catalogStore.setState((state) => {
    if (state.created.some((product) => product.id === id)) {
      return {
        ...state,
        created: state.created.map((product) =>
          product.id === id ? applyPatch(product, patch) : product,
        ),
      };
    }
    return {
      ...state,
      updated: { ...state.updated, [id]: { ...state.updated[id], ...patch } },
    };
  });
}

function deleteProduct(id: string) {
  catalogStore.setState((state) =>
    state.created.some((product) => product.id === id)
      ? {
          ...state,
          created: state.created.filter((product) => product.id !== id),
        }
      : { ...state, deleted: [...new Set([...state.deleted, id])] },
  );
}

/** Adds `delta` units of stock (negative to sell), never below zero. */
function adjustStock(id: string, delta: number) {
  const product = getCatalogProduct(id);
  if (!product) return;
  updateProduct(id, { stock: Math.max(0, product.stock + delta) });
}

function resetCatalog() {
  catalogStore.setState(EMPTY);
}

export {
  adjustStock,
  catalogStore,
  createProduct,
  deleteProduct,
  getCatalog,
  getCatalogProduct,
  isBaseProduct,
  resetCatalog,
  uniqueSlug,
  updateProduct,
  useCatalog,
  useCatalogIsModified,
  type NewProductInput,
  type ProductPatch,
};
