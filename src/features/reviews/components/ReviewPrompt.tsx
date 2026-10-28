"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { useSession } from "@/features/auth/hooks/use-session";
import type { PublicUser } from "@/features/auth/types";
import { loginHref } from "@/features/auth/utils/redirect";
import { useUserOrders } from "@/features/orders/hooks/use-orders";
import type { Product } from "@/features/products/types";
import { WriteReviewDialog } from "@/features/reviews/components/WriteReviewDialog";
import { useOwnReview } from "@/features/reviews/hooks/use-reviews";
import { useState } from "react";

function SignedInPrompt({
  product,
  user,
}: {
  product: Product;
  user: PublicUser;
}) {
  const own = useOwnReview(product.id, user.id);
  const orders = useUserOrders(user);
  const [open, setOpen] = useState(false);
  // Bumped on every open so the form starts from the saved review.
  const [formKey, setFormKey] = useState(0);
  const isVerifiedPurchase = orders.some(
    (order) =>
      order.status === "delivered" &&
      order.items.some((item) => item.productId === product.id),
  );

  function openForm() {
    setFormKey((key) => key + 1);
    setOpen(true);
  }

  const dialog = (
    <WriteReviewDialog
      key={formKey}
      product={product}
      user={user}
      existing={own}
      isVerifiedPurchase={isVerifiedPurchase}
      open={open}
      onOpenChange={setOpen}
    />
  );

  if (own) {
    const copy = {
      pending: {
        title: "Your review is awaiting approval",
        description: "We’ll publish it once our team has checked it.",
      },
      published: {
        title: "Thanks for reviewing this product",
        description: "Your review is live below.",
      },
      rejected: {
        title: "Your review wasn’t published",
        description:
          "It didn’t meet our review guidelines. You can edit and resubmit it.",
      },
    }[own.status];

    return (
      <Alert>
        <AlertTitle>{copy.title}</AlertTitle>
        <AlertDescription className="flex flex-col items-start gap-3">
          {copy.description}
          <Button size="sm" variant="outline" onClick={openForm}>
            Edit review
          </Button>
        </AlertDescription>
        {dialog}
      </Alert>
    );
  }

  return (
    <>
      <Button variant="outline" onClick={openForm}>
        Write a review
      </Button>
      {dialog}
    </>
  );
}

/** "Write a review" for signed-in shoppers, a sign-in link otherwise. */
function ReviewPrompt({ product }: { product: Product }) {
  const { user, hydrated } = useSession();

  if (!hydrated) return null;
  if (!user) {
    return (
      <Button
        variant="outline"
        nativeButton={false}
        render={<Link href={loginHref(`/products/${product.slug}#reviews`)} />}
      >
        Sign in to write a review
      </Button>
    );
  }
  return <SignedInPrompt product={product} user={user} />;
}

export { ReviewPrompt };
