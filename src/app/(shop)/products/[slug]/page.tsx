import { PageContainer } from "@/features/layout/components/PageContainer";
import { getProductBySlug, getProducts } from "@/features/products/api";
import { ProductDetail } from "@/features/products/components/detail/ProductDetail";
import { ProductDetailSkeleton } from "@/features/products/components/detail/ProductDetailSkeleton";
import type { Metadata } from "next";
import { Suspense } from "react";

type Params = PageProps<"/products/[slug]">["params"];

export function generateStaticParams() {
  return getProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const product = getProductBySlug((await params).slug);
  // Admin-created products only exist in the browser; the page sets its own
  // <title> for those once it renders.
  if (!product) return { title: "Product" };

  return {
    title: product.name,
    description: product.description,
    openGraph: { images: product.images.slice(0, 1) },
  };
}

/** Awaits the route params, so it sits inside Suspense for instant navigation. */
async function ProductContent({ params }: { params: Params }) {
  const { slug } = await params;
  return <ProductDetail slug={slug} />;
}

export default function ProductPage({ params }: PageProps<"/products/[slug]">) {
  return (
    <PageContainer className="py-8 sm:py-10">
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductContent params={params} />
      </Suspense>
    </PageContainer>
  );
}
