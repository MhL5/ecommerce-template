import { CategoryGrid } from "@/features/home/components/CategoryGrid";
import { Hero } from "@/features/home/components/Hero";
import { ProductSection } from "@/features/home/components/ProductSection";
import { PromoBanner } from "@/features/home/components/PromoBanner";
import { ValueProps } from "@/features/home/components/ValueProps";
import { getFeaturedProducts, getNewArrivals } from "@/features/products/api";
import { productsHref } from "@/features/products/utils/query";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ValueProps />
      <CategoryGrid />
      <ProductSection
        title="Featured"
        description="Customer favourites and staff picks."
        href="/products"
        products={getFeaturedProducts(8)}
      />
      <PromoBanner />
      <ProductSection
        title="New arrivals"
        description="The latest additions to the shop."
        href={productsHref({ sort: "newest" })}
        products={getNewArrivals(4)}
      />
    </>
  );
}
