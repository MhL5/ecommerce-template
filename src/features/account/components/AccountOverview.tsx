"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { Link } from "@/components/ui/link";
import { toast } from "@/components/ui/toast";
import { AccountOverviewSkeleton } from "@/features/account/components/AccountSkeleton";
import { ChangePasswordDialog } from "@/features/account/components/ChangePasswordDialog";
import { EditProfileDialog } from "@/features/account/components/EditProfileDialog";
import { logout } from "@/features/auth/api/auth-store";
import { useSession } from "@/features/auth/hooks/use-session";
import type { PublicUser } from "@/features/auth/types";
import { initials } from "@/features/auth/utils/initials";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { useUserOrders } from "@/features/orders/hooks/use-orders";
import { formatDate, formatPrice, pluralize } from "@/lib/format";
import type { Route } from "next";

function Overview({ user }: { user: PublicUser }) {
  const orders = useUserOrders(user);
  const totalSpent = orders.reduce((sum, order) => sum + order.totals.total, 0);
  const itemsBought = orders.reduce(
    (sum, order) =>
      sum + order.items.reduce((count, line) => count + line.quantity, 0),
    0,
  );
  const recent = orders.slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <CardTitle className="truncate">{user.name}</CardTitle>
              <CardDescription className="truncate">
                {user.email}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant={user.role === "admin" ? "default" : "secondary"}>
              {user.role === "admin" ? "Admin" : "Customer"}
            </Badge>
            Member since {formatDate(user.createdAt)}
          </CardContent>
          <CardFooter className="mt-auto flex-wrap gap-2">
            <EditProfileDialog user={user} />
            <ChangePasswordDialog user={user} />
            {user.role === "admin" && (
              <Button
                size="sm"
                variant="outline"
                nativeButton={false}
                render={<Link href="/admin" />}
              >
                Admin
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                logout();
                toast.add({ title: "Signed out" });
              }}
            >
              Sign out
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Orders placed</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {orders.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {pluralize(itemsBought, "item")} in total
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total spent</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {formatPrice(totalSpent)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Including shipping and tax
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
          <CardDescription>Your latest purchases.</CardDescription>
          {orders.length > 0 && (
            <CardAction>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href="/account/orders" />}
              >
                View all
              </Button>
            </CardAction>
          )}
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyTitle>No orders yet</EmptyTitle>
                <EmptyDescription>
                  When you place an order it will show up here.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button nativeButton={false} render={<Link href="/products" />}>
                  Start shopping
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <ItemGroup className="gap-2">
              {recent.map((order) => (
                <Item
                  key={order.id}
                  variant="outline"
                  render={
                    <Link href={`/account/orders#${order.number}` as Route} />
                  }
                >
                  <ItemContent>
                    <ItemTitle>
                      {order.number}
                      <OrderStatusBadge status={order.status} />
                    </ItemTitle>
                    <ItemDescription>
                      {formatDate(order.createdAt)} ·{" "}
                      {pluralize(
                        order.items.reduce((n, line) => n + line.quantity, 0),
                        "item",
                      )}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions className="font-medium tabular-nums">
                    {formatPrice(order.totals.total)}
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AccountOverview() {
  const { user } = useSession();
  // AccountShell redirects signed-out visitors; show a skeleton meanwhile.
  if (!user) return <AccountOverviewSkeleton />;
  return <Overview user={user} />;
}

export { AccountOverview };
