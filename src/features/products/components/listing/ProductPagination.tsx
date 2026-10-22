import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import type {
  ProductQuery,
  ProductQueryResult,
} from "@/features/products/types";
import { productsHref } from "@/features/products/utils/query";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

/** Page numbers to show: first, last, and a window around the current page. */
function getPageList(page: number, pageCount: number) {
  const pages = new Set([1, pageCount, page - 1, page, page + 1]);
  const sorted = [...pages]
    .filter((n) => n >= 1 && n <= pageCount)
    .sort((a, b) => a - b);

  const list: (number | "gap")[] = [];
  sorted.forEach((n, index) => {
    const previous = sorted[index - 1];
    if (previous !== undefined && n - previous > 1) list.push("gap");
    list.push(n);
  });
  return list;
}

function ProductPagination({
  query,
  result,
}: {
  query: ProductQuery;
  result: ProductQueryResult;
}) {
  if (result.pageCount <= 1) return null;

  const { page, pageCount } = result;
  const hrefFor = (target: number) => productsHref({ ...query, page: target });

  return (
    <Pagination className="pt-4">
      <PaginationContent>
        <PaginationItem>
          <Button
            variant="ghost"
            aria-label="Go to previous page"
            disabled={page <= 1}
            nativeButton={page <= 1}
            render={page > 1 ? <Link href={hrefFor(page - 1)} /> : undefined}
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              strokeWidth={2}
              data-icon="inline-start"
              className="rtl:rotate-180"
            />
            <span className="hidden sm:block">Previous</span>
          </Button>
        </PaginationItem>
        {getPageList(page, pageCount).map((entry, index) =>
          entry === "gap" ? (
            <PaginationItem key={`gap-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={entry}>
              <Button
                variant={entry === page ? "outline" : "ghost"}
                size="icon"
                aria-current={entry === page ? "page" : undefined}
                nativeButton={false}
                render={<Link href={hrefFor(entry)} />}
              >
                {entry}
              </Button>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <Button
            variant="ghost"
            aria-label="Go to next page"
            disabled={page >= pageCount}
            nativeButton={page >= pageCount}
            render={
              page < pageCount ? <Link href={hrefFor(page + 1)} /> : undefined
            }
          >
            <span className="hidden sm:block">Next</span>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              strokeWidth={2}
              data-icon="inline-end"
              className="rtl:rotate-180"
            />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export { ProductPagination };
