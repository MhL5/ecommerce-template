"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { TextField } from "@/components/ui/text-field";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import type { PublicUser } from "@/features/auth/types";
import type { Product } from "@/features/products/types";
import { submitReview } from "@/features/reviews/api/review-store";
import { StarRatingInput } from "@/features/reviews/components/StarRatingInput";
import type { CustomerReview } from "@/features/reviews/types";
import {
  type ReviewErrors,
  reviewAuthorName,
  validateReview,
} from "@/features/reviews/utils/schema";
import { useState } from "react";

type WriteReviewDialogProps = {
  product: Product;
  user: PublicUser;
  /** Prefills the form when the shopper rewrites their review. */
  existing?: CustomerReview;
  isVerifiedPurchase: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** The parent remounts it (via `key`) each time it opens. */
function WriteReviewDialog({
  product,
  user,
  existing,
  isVerifiedPurchase,
  open,
  onOpenChange,
}: WriteReviewDialogProps) {
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [title, setTitle] = useState(existing?.title ?? "");
  const [body, setBody] = useState(existing?.body ?? "");
  const [errors, setErrors] = useState<ReviewErrors>({});

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateReview({ rating, title, body });
    if (!result.success) {
      setErrors(result.errors);
      const form = event.currentTarget;
      requestAnimationFrame(() =>
        form
          .querySelector<HTMLElement>(
            "[aria-invalid=true] button, [aria-invalid=true]",
          )
          ?.focus(),
      );
      return;
    }
    submitReview({
      ...result.data,
      productId: product.id,
      userId: user.id,
      author: reviewAuthorName(user.name),
      isVerifiedPurchase,
    });
    onOpenChange(false);
    toast.add({
      type: "success",
      title: "Thanks for your review",
      description: "It will appear once our team has checked it.",
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form noValidate className="flex flex-col gap-6" onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Review {product.name}</DialogTitle>
            <DialogDescription>
              Reviews are checked before they’re published.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="gap-5">
            <Field data-invalid={!!errors.rating}>
              <FieldLabel htmlFor="review-rating">Your rating</FieldLabel>
              <StarRatingInput
                id="review-rating"
                value={rating}
                invalid={!!errors.rating}
                onChange={(value) => {
                  setRating(value);
                  setErrors((previous) => ({ ...previous, rating: undefined }));
                }}
              />
              {errors.rating && <FieldError>{errors.rating}</FieldError>}
            </Field>
            <TextField
              name="title"
              idPrefix="review"
              label="Title"
              placeholder="Sum it up in a few words"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setErrors((previous) => ({ ...previous, title: undefined }));
              }}
              error={errors.title}
            />
            <Field data-invalid={!!errors.body}>
              <FieldLabel htmlFor="review-body">Review</FieldLabel>
              <Textarea
                id="review-body"
                rows={5}
                value={body}
                placeholder="What did you like or dislike? How do you use it?"
                aria-invalid={!!errors.body}
                onChange={(event) => {
                  setBody(event.target.value);
                  setErrors((previous) => ({ ...previous, body: undefined }));
                }}
              />
              {errors.body ? (
                <FieldError>{errors.body}</FieldError>
              ) : (
                <FieldDescription>
                  Posted as {reviewAuthorName(user.name)}
                  {isVerifiedPurchase && " · Verified buyer"}.
                </FieldDescription>
              )}
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit">
              {existing ? "Update review" : "Submit review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { WriteReviewDialog };
