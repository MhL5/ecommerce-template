"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { AdminSkeleton } from "@/features/admin/components/AdminSkeleton";
import { OrderSheet } from "@/features/admin/components/orders/OrderSheet";
import { getStatusCounts } from "@/features/admin/utils/dashboard";
import { useSession } from "@/features/auth/hooks/use-session";
import {
  ORDER_STATUS_LABELS,
  OrderStatusBadge,
} from "@/features/orders/components/OrderStatusBadge";
import { useAllOrders } from "@/features/orders/hooks/use-orders";
import type { Order, OrderStatus } from "@/features/orders/types";
import { formatDate, formatPrice, pluralize } from "@/lib/format";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type StatusFilter = "all" | OrderStatus;

const statusFilters: StatusFilter[] = [
  "all",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function matches(order: Order, search: string) {
  const terms = search.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = [
    order.number,
    order.email,
    order.shippingAddress.firstName,
    order.shippingAddress.lastName,
    order.discountCode ?? "",
  ]
    .join(" ")
    .toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

/** Reads `?order=<id>` (links from the dashboard), so it renders in Suspense. */
function AdminOrders() {
  const { isAdmin } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderParam = searchParams.get("order");
  const { orders } = useAllOrders();
  const [status, setStatus] = useState<StatusFilter>("all");
  // `?q=` comes from the customers page ("Orders" for one customer).
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [handledParam, setHandledParam] = useState<string | null>(null);

  // Open the order from `?order=` once the session is known.
  if (isAdmin && orderParam && orderParam !== handledParam) {
    setHandledParam(orderParam);
    setSelectedId(orderParam);
  }

  if (!isAdmin) return <AdminSkeleton />;

  const counts = getStatusCounts(orders);
  const visible = orders.filter(
    (order) =>
      (status === "all" || order.status === status) && matches(order, search),
  );
  // Read from the live list so status changes show in the open sheet.
  const selected = orders.find((order) => order.id === selectedId);

  function closeSheet(open: boolean) {
    if (open) return;
    setSelectedId(null);
    if (orderParam) router.replace("/admin/orders", { scroll: false });
  }

  return (
    <>
      <AdminPageHeader
        title="Orders"
        description="Every order placed in this browser plus the demo history. Open one to move it through fulfilment."
      />

      <Card className="gap-0 pb-0">
        <CardHeader className="flex flex-col gap-4 border-b pb-4 xl:flex-row xl:items-center xl:justify-between">
          <CardTitle>
            {pluralize(visible.length, "order")}
            {visible.length !== orders.length && (
              <span className="font-normal text-muted-foreground">
                {" "}
                of {orders.length}
              </span>
            )}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <ToggleGroup
              variant="outline"
              size="sm"
              spacing={0}
              value={[status]}
              onValueChange={(value) => {
                const next = value[0] as StatusFilter | undefined;
                if (next) setStatus(next);
              }}
              aria-label="Filter by status"
            >
              {statusFilters.map((filter) => (
                <ToggleGroupItem key={filter} value={filter}>
                  {filter === "all" ? "All" : ORDER_STATUS_LABELS[filter]}
                  <span className="text-muted-foreground tabular-nums">
                    {filter === "all" ? orders.length : counts[filter]}
                  </span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <InputGroup className="w-full sm:w-64">
              <InputGroupInput
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Order #, name, email, code…"
                aria-label="Search orders"
              />
              <InputGroupAddon>
                <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
              </InputGroupAddon>
            </InputGroup>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          {visible.length === 0 ? (
            <Empty className="py-12">
              <EmptyHeader>
                <EmptyTitle>No orders match</EmptyTitle>
                <EmptyDescription>
                  Try another status or clear the search.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatus("all");
                    setSearch("");
                  }}
                >
                  Reset filters
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="ps-6">Order</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-end">Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-end">Total</TableHead>
                  <TableHead className="pe-6">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="ps-6 font-medium">
                      {order.number}
                      {order.discountCode && (
                        <span className="block text-xs font-normal text-muted-foreground">
                          {order.discountCode}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell>
                      <span className="flex flex-col">
                        <span>
                          {order.shippingAddress.firstName}{" "}
                          {order.shippingAddress.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {order.email}
                          {order.userId ? "" : " · guest"}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="text-end tabular-nums">
                      {order.items.reduce(
                        (sum, line) => sum + line.quantity,
                        0,
                      )}
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-end tabular-nums">
                      {formatPrice(order.totals.total)}
                    </TableCell>
                    <TableCell className="pe-6 text-end">
                      <Button
                        variant="outline"
                        size="sm"
                        aria-label={`View order ${order.number}`}
                        onClick={() => setSelectedId(order.id)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <OrderSheet
        order={selected}
        open={selectedId !== null}
        onOpenChange={closeSheet}
      />
    </>
  );
}

export { AdminOrders };
