"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Link } from "@/components/ui/link";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderDetails } from "@/features/orders/components/OrderDetails";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { useOrder } from "@/features/orders/hooks/use-orders";
import { formatDate } from "@/lib/format";
import {
  CheckmarkCircle02Icon,
  PackageSearchIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSearchParams } from "next/navigation";

function OrderConfirmationSkeleton() {
  return (
    <div className="flex flex-col items-center gap-6" aria-busy="true">
      <Skeleton className="size-12 rounded-full" />
      <Skeleton className="h-8 w-72" />
      <Skeleton className="h-4 w-96 max-w-full" />
      <Skeleton className="h-80 w-full max-w-3xl rounded-xl" />
    </div>
  );
}

/** Reads `?order=` (so it renders inside Suspense) and shows that order. */
function OrderConfirmation() {
  const orderId = useSearchParams().get("order");
  const { order, hydrated } = useOrder(orderId);

  if (!hydrated) return <OrderConfirmationSkeleton />;

  if (!order) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={PackageSearchIcon} strokeWidth={2} />
          </EmptyMedia>
          <EmptyTitle>We couldn’t find that order</EmptyTitle>
          <EmptyDescription>
            Orders are saved in this browser only. If you placed it on another
            device or cleared your data, it won’t show up here.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center">
          <Button nativeButton={false} render={<Link href="/products" />}>
            Continue shopping
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/account/orders" />}
          >
            Order history
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground [&_svg]:size-6">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} />
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          Thanks, {order.shippingAddress.firstName}! Your order is confirmed.
        </h1>
        <p className="max-w-xl text-pretty text-muted-foreground">
          We’ve sent a (pretend) confirmation to{" "}
          <span className="font-medium text-foreground">{order.email}</span>.
          You’ll hear from us again when it ships.
        </p>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Order {order.number}</CardTitle>
          <CardDescription>
            Placed {formatDate(order.createdAt)}
          </CardDescription>
          <CardAction>
            <OrderStatusBadge status={order.status} />
          </CardAction>
        </CardHeader>
        <CardContent>
          <OrderDetails order={order} />
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-center gap-3">
        <Button
          size="lg"
          nativeButton={false}
          render={<Link href="/products" />}
        >
          Continue shopping
        </Button>
        <Button
          size="lg"
          variant="outline"
          nativeButton={false}
          render={<Link href="/account/orders" />}
        >
          View order history
        </Button>
      </div>
    </div>
  );
}

export { OrderConfirmation, OrderConfirmationSkeleton };
