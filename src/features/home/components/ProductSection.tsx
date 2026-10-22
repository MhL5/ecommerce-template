import { SectionHeading } from "@/features/home/components/SectionHeading";
import { PageContainer } from "@/features/layout/components/PageContainer";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import type { Product } from "@/features/products/types";
import type { Route } from "next";

type ProductSectionProps = {
  title: string;
  description?: string;
  href: Route;
  products: Product[];
};

function ProductSection({
  title,
  description,
  href,
  products,
}: ProductSectionProps) {
  return (
    <PageContainer className="flex flex-col gap-6 py-12 sm:py-16">
      <SectionHeading title={title} description={description} href={href} />
      <ProductGrid products={products} />
    </PageContainer>
  );
}

export { ProductSection };
