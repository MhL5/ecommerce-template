type CategoryId =
  | "electronics"
  | "clothing"
  | "home-kitchen"
  | "sports-outdoors"
  | "beauty"
  | "accessories";

type Category = {
  id: CategoryId;
  name: string;
  description: string;
  image: string;
};

type ProductSpec = {
  label: string;
  value: string;
};

/** An axis a product varies on, e.g. Color or Size. */
type ProductOption = {
  name: string;
  values: {
    value: string;
    /** CSS colour for swatch pickers. */
    swatch?: string;
  }[];
};

/** One sellable combination of option values. */
type ProductVariant = {
  id: string;
  /** Display name built from the values, e.g. "Black / M". */
  title: string;
  /** One value per option, in the same order as `Product.options`. */
  values: string[];
  sku: string;
  stock: number;
};

type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  categoryId: CategoryId;
  description: string;
  highlights: string[];
  specs: ProductSpec[];
  /** Price in integer cents. */
  price: number;
  /** Original price in cents when the product is on sale. */
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  /** Units in stock; for products with variants, the sum of their stock. */
  stock: number;
  /** Set together with `variants` when the product comes in options. */
  options?: ProductOption[];
  variants?: ProductVariant[];
  images: string[];
  tags: string[];
  featured: boolean;
  createdAt: string;
};

type Review = {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
};

type ProductSort =
  "featured" | "newest" | "price-asc" | "price-desc" | "rating" | "name";

type ProductQuery = {
  q: string;
  categories: CategoryId[];
  brands: string[];
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number | null;
  inStock: boolean;
  onSale: boolean;
  sort: ProductSort;
  page: number;
};

type ProductQueryResult = {
  items: Product[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
};

export type {
  Category,
  CategoryId,
  Product,
  ProductQuery,
  ProductQueryResult,
  ProductOption,
  ProductSort,
  ProductSpec,
  ProductVariant,
  Review,
};
