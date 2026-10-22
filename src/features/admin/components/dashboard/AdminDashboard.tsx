"use client";

import { Img } from "@/components/ui/Img";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Link } from "@/components/ui/link";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { AdminSkeleton } from "@/features/admin/components/AdminSkeleton";
import { RevenueChart } from "@/features/admin/components/dashboard/RevenueChart";
import {
  getDailyRevenue,
  getKpis,
  getStatusCounts,
  getTopProducts,
} from "@/features/admin/utils/dashboard";
import { useSession } from "@/features/auth/hooks/use-session";
import {
  ORDER_STATUS_LABELS,
  OrderStatusBadge,
} from "@/features/orders/components/OrderStatusBadge";
import { useAllOrders } from "@/features/orders/hooks/use-orders";
import type { OrderStatus } from "@/features/orders/types";
import { useCatalog } from "@/features/products/api/catalog-store";
import { LOW_STOCK_THRESHOLD } from "@/features/products/utils/product";
import { formatDate, formatPrice } from "@/lib/format";
import {
  ArrowDownRight01Icon,
  ArrowUpRight01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Route } from "next";
import { useState } from "react";

function ChangeBadge({ value }: { value: number | null }) {
  if (value === null) return <Badge variant="outline">New</Badge>;
  const up = value >= 0;
  // Text tokens only: direction is carried by the arrow and the sign.
  return (
    <Badge variant="outline">
      <HugeiconsIcon
        icon={up ? ArrowUpRight01Icon : ArrowDownRight01Icon}
        strokeWidth={2}
      />
      {up ? "+" : ""}
      {value}%
    </Badge>
  );
}

function KpiCard({
  label,
  value,
  change,
  footnote,
}: {
  label: string;
  value: string;
  change?: number | null;
  footnote: string;
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
        {change !== undefined && (
          <CardAction>
            <ChangeBadge value={change} />
          </CardAction>
        )}
      </CardHeader>
      <CardFooter className="text-xs text-muted-foreground">
        {footnote}
      </CardFooter>
    </Card>
  );
}

const statusOrder: OrderStatus[] = [
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function Dashboard() {
  const { orders } = useAllOrders();
  const catalog = useCatalog();
  // Read the clock once per mount (only after hydration, behind the admin check).
  const [now] = useState(() => Date.now());

  const kpis = getKpis(orders, now);
  const daily = getDailyRevenue(orders, now);
  const statuses = getStatusCounts(orders);
  const topProducts = getTopProducts(orders);
  const lowStock = catalog
    .filter((product) => product.stock <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 6);
  const recent = orders.slice(0, 6);

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Sales, orders and stock at a glance. Figures compare the last 30 days with the 30 before."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Revenue"
          value={formatPrice(kpis.revenue.value)}
          change={kpis.revenue.change}
          footnote="Last 30 days, excl. cancelled"
        />
        <KpiCard
          label="Orders"
          value={String(kpis.orders.value)}
          change={kpis.orders.change}
          footnote="Last 30 days, excl. cancelled"
        />
        <KpiCard
          label="Average order"
          value={formatPrice(kpis.average.value)}
          change={kpis.average.change}
          footnote="Revenue ÷ orders"
        />
        <KpiCard
          label="Customers"
          value={String(kpis.customers.value)}
          footnote={`${kpis.customers.active} ordered in the last 30 days`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <RevenueChart data={daily} />
        <Card>
          <CardHeader>
            <CardTitle>Orders by status</CardTitle>
            <CardDescription>All {orders.length} orders</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {statusOrder.map((status) => (
              <div key={status} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span>{ORDER_STATUS_LABELS[status]}</span>
                  <span className="font-medium tabular-nums">
                    {statuses[status]}
                  </span>
                </div>
                <Progress
                  value={
                    orders.length
                      ? Math.round((statuses[status] / orders.length) * 100)
                      : 0
                  }
                  aria-label={`${ORDER_STATUS_LABELS[status]}: ${statuses[status]} orders`}
                />
              </div>
            ))}
          </CardContent>
          <CardFooter className="mt-auto">
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/admin/orders" />}
            >
              Manage orders
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>The latest six, newest first.</CardDescription>
            <CardAction>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href="/admin/orders" />}
              >
                View all
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="ps-6">Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pe-6 text-end">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="ps-6 font-medium">
                      <Link
                        href={`/admin/orders?order=${order.id}` as Route}
                        className="rounded-sm outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        {order.number}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {order.shippingAddress.firstName}{" "}
                      {order.shippingAddress.lastName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="pe-6 text-end tabular-nums">
                      {formatPrice(order.totals.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Low stock</CardTitle>
              <CardDescription>
                {LOW_STOCK_THRESHOLD} or fewer units left
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lowStock.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Everything is well stocked.
                </p>
              ) : (
                <ItemGroup className="gap-1">
                  {lowStock.map((product) => (
                    <Item
                      key={product.id}
                      size="xs"
                      render={
                        <Link
                          href={`/admin/products?edit=${product.id}` as Route}
                        />
                      }
                    >
                      <ItemMedia variant="image">
                        <Img
                          src={product.images[0] ?? ""}
                          alt=""
                          width={40}
                          height={40}
                        />
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle className="line-clamp-1">
                          {product.name}
                        </ItemTitle>
                      </ItemContent>
                      <ItemActions>
                        <Badge
                          variant={
                            product.stock === 0 ? "destructive" : "outline"
                          }
                        >
                          {product.stock === 0
                            ? "Out"
                            : `${product.stock} left`}
                        </Badge>
                      </ItemActions>
                    </Item>
                  ))}
                </ItemGroup>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Best sellers</CardTitle>
              <CardDescription>By units sold, all time</CardDescription>
            </CardHeader>
            <CardContent>
              <ItemGroup className="gap-1">
                {topProducts.map((product, index) => (
                  <Item key={product.productId} size="xs">
                    <ItemMedia className="w-4 justify-center text-xs text-muted-foreground tabular-nums">
                      {index + 1}
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle className="line-clamp-1">
                        {product.name}
                      </ItemTitle>
                      <ItemDescription>
                        {formatPrice(product.revenue)}
                      </ItemDescription>
                    </ItemContent>
                    <ItemActions className="text-sm tabular-nums">
                      {product.units} sold
                    </ItemActions>
                  </Item>
                ))}
              </ItemGroup>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function AdminDashboard() {
  const { isAdmin } = useSession();
  // AdminShell handles redirects and access; wait for a confirmed admin.
  if (!isAdmin) return <AdminSkeleton />;
  return <Dashboard />;
}

export { AdminDashboard };
