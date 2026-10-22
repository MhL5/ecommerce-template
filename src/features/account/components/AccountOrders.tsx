"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Link } from "@/components/ui/link";
import { AccountOrdersSkeleton } from "@/features/account/components/AccountSkeleton";
import { useSession } from "@/features/auth/hooks/use-session";
import type { PublicUser } from "@/features/auth/types";
import { CancelOrderButton } from "@/features/orders/components/CancelOrderButton";
import { OrderDetails } from "@/features/orders/components/OrderDetails";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { useUserOrders } from "@/features/orders/hooks/use-orders";
import { formatDate, formatPrice, pluralize } from "@/lib/format";
import { PackageIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState, useSyncExternalStore } from "react";

function subscribeToHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

const getHash = () => decodeURIComponent(window.location.hash.slice(1));
const getServerHash = () => "";

function OrderList({ user }: { user: PublicUser }) {
  const orders = useUserOrders(user);
  const hash = useSyncExternalStore(subscribeToHash, getHash, getServerHash);
  const [open, setOpen] = useState<string[]>(() =>
    orders[0] ? [orders[0].id] : [],
  );
  const [seenHash, setSeenHash] = useState("");

  // `/account/orders#NS-XXXXXX` (from the overview) opens that order.
  if (hash !== seenHash) {
    setSeenHash(hash);
    const target = orders.find((order) => order.number === hash);
    if (target && !open.includes(target.id)) setOpen([target.id]);
  }

  if (orders.length === 0) {
    return (
      <Empty className="border border-dashed py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={PackageIcon} strokeWidth={2} />
          </EmptyMedia>
          <EmptyTitle>No orders yet</EmptyTitle>
          <EmptyDescription>
            Orders you place while signed in — or as a guest with {user.email} —
            will appear here.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button nativeButton={false} render={<Link href="/products" />}>
            Start shopping
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {pluralize(orders.length, "order")}, newest first.
      </p>
      <Card className="py-0">
        <CardContent>
          <Accordion
            multiple
            value={open}
            onValueChange={(value) => setOpen(value as string[])}
          >
            {orders.map((order) => {
              const count = order.items.reduce(
                (sum, line) => sum + line.quantity,
                0,
              );
              return (
                <AccordionItem
                  key={order.id}
                  value={order.id}
                  id={order.number}
                  className="scroll-mt-24"
                >
                  <AccordionTrigger className="items-center gap-4 hover:no-underline">
                    <span className="grid flex-1 grid-cols-2 items-center gap-x-4 gap-y-1 sm:grid-cols-[8rem_1fr_auto_6rem]">
                      <span className="font-medium">{order.number}</span>
                      <span className="text-end text-muted-foreground sm:text-start">
                        {formatDate(order.createdAt)} ·{" "}
                        {pluralize(count, "item")}
                      </span>
                      <span>
                        <OrderStatusBadge status={order.status} />
                      </span>
                      <span className="text-end font-medium tabular-nums">
                        {formatPrice(order.totals.total)}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-6">
                    <div className="flex flex-col gap-4">
                      <OrderDetails order={order} />
                      <div className="flex justify-end">
                        <CancelOrderButton order={order} />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

function AccountOrders() {
  const { user } = useSession();
  // AccountShell redirects signed-out visitors; show a skeleton meanwhile.
  if (!user) return <AccountOrdersSkeleton />;
  return <OrderList user={user} />;
}

export { AccountOrders };
