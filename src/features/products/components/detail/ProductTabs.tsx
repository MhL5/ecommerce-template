"use client";

import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductRating } from "@/features/products/components/ProductRating";
import type { Product } from "@/features/products/types";
import { ReviewPrompt } from "@/features/reviews/components/ReviewPrompt";
import type { ProductReviewSummary } from "@/features/reviews/hooks/use-reviews";
import { formatDate, pluralize } from "@/lib/format";
import { type ReactNode, useState, useSyncExternalStore } from "react";

type TabValue = "description" | "specs" | "reviews";

function subscribeToHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

const getHash = () => window.location.hash;
const getServerHash = () => "";

function ReviewList({
  summary,
  children,
}: {
  summary: ProductReviewSummary;
  children: ReactNode;
}) {
  const { reviews, rating, reviewCount } = summary;

  return (
    <div className="grid gap-8 md:grid-cols-[14rem_1fr]">
      <div className="flex flex-col items-start gap-2">
        {reviewCount > 0 && (
          <>
            <p className="text-4xl font-semibold tabular-nums">
              {rating.toFixed(1)}
            </p>
            <ProductRating rating={rating} />
            <p className="text-sm text-muted-foreground">
              Based on {pluralize(reviewCount, "review")}
            </p>
          </>
        )}
        {children}
      </div>
      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No reviews yet. Be the first to share what you think.
        </p>
      ) : (
        <ul className="flex flex-col gap-6">
          {reviews.map((review, index) => (
            <li key={review.id} className="flex flex-col gap-2">
              {index > 0 && <Separator className="mb-4" />}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <ProductRating rating={review.rating} size="sm" />
                <span className="text-xs text-muted-foreground">
                  {formatDate(review.date)}
                </span>
              </div>
              <p className="font-medium">{review.title}</p>
              <p className="text-sm text-pretty text-muted-foreground">
                {review.body}
              </p>
              <p className="text-xs text-muted-foreground">
                {review.author}
                {review.isVerifiedPurchase && " · Verified buyer"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProductTabs({
  product,
  reviews,
}: {
  product: Product;
  reviews: ProductReviewSummary;
}) {
  const [value, setValue] = useState<TabValue>("description");
  const hash = useSyncExternalStore(subscribeToHash, getHash, getServerHash);
  const [seenHash, setSeenHash] = useState(hash);

  // The rating link in the product header points at #reviews.
  if (hash !== seenHash) {
    setSeenHash(hash);
    if (hash === "#reviews") setValue("reviews");
  }

  return (
    <section id="reviews" className="scroll-mt-24" aria-label="Product details">
      <Tabs value={value} onValueChange={(next) => setValue(next as TabValue)}>
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specs">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews ({reviews.reviewCount.toLocaleString("en-US")})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="max-w-3xl pt-4">
          <div className="flex flex-col gap-4 text-pretty text-muted-foreground">
            <p>{product.description}</p>
            <p>
              Every {product.brand} piece we stock is checked by our team before
              it ships. If it isn’t right, return it within 30 days for a full
              refund.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="specs" className="max-w-2xl pt-4">
          <Table>
            <TableBody>
              <TableRow>
                <TableHead scope="row" className="w-48">
                  Brand
                </TableHead>
                <TableCell>{product.brand}</TableCell>
              </TableRow>
              {product.specs.map((spec) => (
                <TableRow key={spec.label}>
                  <TableHead scope="row" className="w-48">
                    {spec.label}
                  </TableHead>
                  <TableCell>{spec.value}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableHead scope="row" className="w-48">
                  SKU
                </TableHead>
                <TableCell className="font-mono">
                  NS-{product.id.toUpperCase()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="reviews" className="pt-4">
          <ReviewList summary={reviews}>
            <ReviewPrompt product={product} />
          </ReviewList>
        </TabsContent>
      </Tabs>
    </section>
  );
}

export { ProductTabs };
