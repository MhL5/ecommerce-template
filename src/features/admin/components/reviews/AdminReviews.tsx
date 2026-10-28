"use client";

import { Img } from "@/components/ui/Img";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Link } from "@/components/ui/link";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { AdminSkeleton } from "@/features/admin/components/AdminSkeleton";
import { useSession } from "@/features/auth/hooks/use-session";
import { useCatalog } from "@/features/products/api/catalog-store";
import { ProductRating } from "@/features/products/components/ProductRating";
import type { Product } from "@/features/products/types";
import {
  deleteReview,
  setReviewStatus,
  useCustomerReviews,
} from "@/features/reviews/api/review-store";
import type { CustomerReview, ReviewStatus } from "@/features/reviews/types";
import { formatDate, pluralize } from "@/lib/format";
import {
  CheckmarkCircle02Icon,
  MessageMultiple01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Fragment, useState } from "react";

type StatusFilter = "all" | ReviewStatus;

const filters: { value: StatusFilter; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "published", label: "Published" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

const statusBadges = {
  pending: { label: "Pending", variant: "outline" },
  published: { label: "Published", variant: "secondary" },
  rejected: { label: "Rejected", variant: "destructive" },
} as const satisfies Record<ReviewStatus, { label: string; variant: string }>;

function DeleteReviewButton({ review }: { review: CustomerReview }) {
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button size="sm" variant="ghost" className="text-destructive" />
        }
      >
        Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this review?</AlertDialogTitle>
          <AlertDialogDescription>
            “{review.title}” by {review.author} is removed for good. To hide it
            but keep a record, reject it instead.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              deleteReview(review.id);
              setOpen(false);
              toast.add({ title: "Review deleted" });
            }}
          >
            Delete review
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ReviewRow({
  review,
  product,
}: {
  review: CustomerReview;
  product: Product | undefined;
}) {
  const badge = statusBadges[review.status];

  function moderate(status: ReviewStatus) {
    setReviewStatus(review.id, status);
    toast.add({
      title: status === "published" ? "Review published" : "Review rejected",
      description: review.title,
    });
  }

  return (
    <article className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-start">
      <div className="flex min-w-0 items-center gap-3 lg:w-56 lg:shrink-0">
        <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10">
          {product?.images[0] && (
            <Img
              src={product.images[0]}
              alt=""
              fill
              sizes="48px"
              className="object-cover"
            />
          )}
        </span>
        {product ? (
          <Link
            href={`/products/${product.slug}`}
            className="line-clamp-2 rounded-sm text-sm font-medium outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {product.name}
          </Link>
        ) : (
          <span className="text-sm text-muted-foreground">Deleted product</span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <ProductRating rating={review.rating} size="sm" />
          <Badge variant={badge.variant}>{badge.label}</Badge>
          {review.isVerifiedPurchase && (
            <Badge variant="secondary">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} />
              Verified buyer
            </Badge>
          )}
        </div>
        <p className="font-medium">{review.title}</p>
        <p className="text-sm text-pretty text-muted-foreground">
          {review.body}
        </p>
        <p className="text-xs text-muted-foreground">
          {review.author} · {formatDate(review.date)}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 lg:w-48 lg:shrink-0 lg:justify-end">
        {review.status !== "published" && (
          <Button size="sm" onClick={() => moderate("published")}>
            Publish
          </Button>
        )}
        {review.status !== "rejected" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => moderate("rejected")}
          >
            {review.status === "published" ? "Unpublish" : "Reject"}
          </Button>
        )}
        <DeleteReviewButton review={review} />
      </div>
    </article>
  );
}

function AdminReviews() {
  const { isAdmin } = useSession();
  const reviews = useCustomerReviews();
  const catalog = useCatalog();
  const [filter, setFilter] = useState<StatusFilter>("pending");

  if (!isAdmin) return <AdminSkeleton />;

  const counts = {
    all: reviews.length,
    pending: 0,
    published: 0,
    rejected: 0,
  } satisfies Record<StatusFilter, number>;
  for (const review of reviews) counts[review.status] += 1;

  const visible = reviews
    .filter((review) => filter === "all" || review.status === filter)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <AdminPageHeader
        title="Reviews"
        description="Reviews written by shoppers wait here until you publish them. Catalogue reviews from the original data are always shown."
      />

      <Card className="gap-0 pb-0">
        <CardHeader className="flex flex-col gap-4 border-b pb-4 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle>
            {pluralize(visible.length, "review")}
            {counts.pending > 0 && filter !== "pending" && (
              <span className="font-normal text-muted-foreground">
                {" "}
                · {counts.pending} waiting
              </span>
            )}
          </CardTitle>
          <ToggleGroup
            variant="outline"
            size="sm"
            spacing={0}
            value={[filter]}
            onValueChange={(value) => {
              const next = value[0] as StatusFilter | undefined;
              if (next) setFilter(next);
            }}
            aria-label="Filter by status"
          >
            {filters.map((option) => (
              <ToggleGroupItem key={option.value} value={option.value}>
                {option.label}
                <span className="text-muted-foreground tabular-nums">
                  {counts[option.value]}
                </span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CardHeader>
        <CardContent className="px-0">
          {visible.length === 0 ? (
            <Empty className="py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HugeiconsIcon icon={MessageMultiple01Icon} strokeWidth={2} />
                </EmptyMedia>
                <EmptyTitle>
                  {filter === "pending" ? "All caught up" : "No reviews here"}
                </EmptyTitle>
                <EmptyDescription>
                  {filter === "pending"
                    ? "New reviews from shoppers will show up here."
                    : "Try another status."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            visible.map((review, index) => (
              <Fragment key={review.id}>
                {index > 0 && <Separator />}
                <ReviewRow
                  review={review}
                  product={catalog.find(
                    (product) => product.id === review.productId,
                  )}
                />
              </Fragment>
            ))
          )}
        </CardContent>
      </Card>
    </>
  );
}

export { AdminReviews };
