import { Img } from "@/components/ui/Img";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { PageContainer } from "@/features/layout/components/PageContainer";
import { getFeaturedProducts } from "@/features/products/api";
import { productsHref } from "@/features/products/utils/query";
import { cn } from "@/lib/utils";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

function Hero() {
  const showcase = getFeaturedProducts(4);

  return (
    <section className="border-b bg-muted/40">
      <PageContainer className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:py-20">
        <div className="flex flex-col items-start gap-6">
          <Badge variant="outline" className="bg-background">
            New season · Autumn 2026
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Well-made goods for everyday life
          </h1>
          <p className="max-w-lg text-lg text-pretty text-muted-foreground">
            Thoughtfully designed tech, clothing and homeware from independent
            brands — with free shipping over $75 and 30-day returns.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              className="px-4"
              nativeButton={false}
              render={<Link href="/products" />}
            >
              Shop the collection
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                strokeWidth={2}
                data-icon="inline-end"
                className="rtl:rotate-180"
              />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-4"
              nativeButton={false}
              render={<Link href={productsHref({ onSale: true })} />}
            >
              View deals
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {showcase.map((product, index) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-2xl bg-muted ring-1 ring-foreground/10 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                index % 2 === 1 && "translate-y-6",
              )}
            >
              <Img
                src={product.images[index === 2 ? 2 : 0] ?? ""}
                alt={product.name}
                fill
                priority
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
              />
              <span className="absolute inset-x-2 bottom-2 truncate rounded-lg bg-background/85 px-2.5 py-1.5 text-xs font-medium backdrop-blur-sm">
                {product.name}
              </span>
            </Link>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}

export { Hero };
