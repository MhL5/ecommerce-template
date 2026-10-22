import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { PageContainer } from "@/features/layout/components/PageContainer";
import { getDeals } from "@/features/products/api";
import { getDiscountPercent } from "@/features/products/utils/product";
import { productsHref } from "@/features/products/utils/query";

function PromoBanner() {
  const deals = getDeals(36);
  const maxDiscount = Math.max(...deals.map(getDiscountPercent));

  return (
    <PageContainer className="py-12 sm:py-16">
      <section className="flex flex-col items-start gap-6 rounded-3xl bg-primary px-6 py-10 text-primary-foreground sm:px-10 md:flex-row md:items-center md:justify-between">
        <div className="flex max-w-xl flex-col gap-2">
          <p className="text-sm font-medium opacity-80">
            Autumn sale · {deals.length} items reduced
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance">
            Up to {maxDiscount}% off selected favourites
          </h2>
          <p className="text-pretty opacity-80">
            Headphones, knitwear, cookware and more — while stock lasts.
          </p>
        </div>
        <Button
          size="lg"
          variant="secondary"
          className="px-5"
          nativeButton={false}
          render={<Link href={productsHref({ onSale: true })} />}
        >
          Shop the sale
        </Button>
      </section>
    </PageContainer>
  );
}

export { PromoBanner };
