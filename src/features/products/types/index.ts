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
  stock: number;
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
  ProductSort,
  ProductSpec,
  Review,
};
