import { Img } from "@/components/ui/Img";
import { Link } from "@/components/ui/link";
import { SectionHeading } from "@/features/home/components/SectionHeading";
import { PageContainer } from "@/features/layout/components/PageContainer";
import {
  getCategories,
  getCategoryProductCounts,
} from "@/features/products/api";
import { productsHref } from "@/features/products/utils/query";
import { pluralize } from "@/lib/format";

function CategoryGrid() {
  const categories = getCategories();
  const counts = getCategoryProductCounts();

  return (
    <PageContainer className="flex flex-col gap-6 py-12 sm:py-16">
      <SectionHeading
        title="Shop by category"
        description="Six departments, hand-picked for quality."
        href="/products"
        linkLabel="All products"
      />
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={productsHref({ categories: [category.id] })}
              className="group flex flex-col gap-3 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className="relative block aspect-square overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/10">
                <Img
                  src={category.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 16vw, (min-width: 768px) 33vw, 50vw"
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                />
              </span>
              <span className="flex flex-col gap-0.5 px-0.5">
                <span className="text-sm font-medium">{category.name}</span>
                <span className="text-xs text-muted-foreground">
                  {pluralize(counts.get(category.id) ?? 0, "product")}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}

export { CategoryGrid };
