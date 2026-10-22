"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Link } from "@/components/ui/link";
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
import { buildCustomerRows } from "@/features/admin/utils/customers";
import { useAllUsers } from "@/features/auth/api/auth-store";
import { useSession } from "@/features/auth/hooks/use-session";
import { initials } from "@/features/auth/utils/initials";
import { useAllOrders } from "@/features/orders/hooks/use-orders";
import { formatDate, formatPrice } from "@/lib/format";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Route } from "next";
import { useState } from "react";

type KindFilter = "all" | "account" | "guest";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function Customers() {
  const users = useAllUsers();
  const { orders } = useAllOrders();
  const [kind, setKind] = useState<KindFilter>("all");
  const [search, setSearch] = useState("");

  const rows = buildCustomerRows(users, orders);
  const terms = search.toLowerCase().split(/\s+/).filter(Boolean);
  const visible = rows.filter(
    (row) =>
      (kind === "all" || row.kind === kind) &&
      terms.every((term) =>
        `${row.name} ${row.email}`.toLowerCase().includes(term),
      ),
  );
  const accounts = rows.filter((row) => row.kind === "account").length;
  const repeat = rows.filter((row) => row.orders > 1).length;
  const spent = rows.reduce((sum, row) => sum + row.spent, 0);
  const buyers = rows.filter((row) => row.orders > 0).length;

  return (
    <>
      <AdminPageHeader
        title="Customers"
        description="Registered accounts (including ones created on /register in this browser) and guest shoppers."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Customers" value={String(rows.length)} />
        <StatCard label="With an account" value={String(accounts)} />
        <StatCard label="Repeat buyers" value={String(repeat)} />
        <StatCard
          label="Average lifetime spend"
          value={formatPrice(buyers ? Math.round(spent / buyers) : 0)}
        />
      </div>

      <Card className="gap-0 pb-0">
        <CardHeader className="flex flex-col gap-4 border-b pb-4 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle>
            {visible.length} of {rows.length}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <ToggleGroup
              variant="outline"
              size="sm"
              spacing={0}
              value={[kind]}
              onValueChange={(value) => {
                const next = value[0] as KindFilter | undefined;
                if (next) setKind(next);
              }}
              aria-label="Filter customers"
            >
              <ToggleGroupItem value="all">All</ToggleGroupItem>
              <ToggleGroupItem value="account">Accounts</ToggleGroupItem>
              <ToggleGroupItem value="guest">Guests</ToggleGroupItem>
            </ToggleGroup>
            <InputGroup className="w-full sm:w-64">
              <InputGroupInput
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name or email…"
                aria-label="Search customers"
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
                <EmptyTitle>No customers match</EmptyTitle>
                <EmptyDescription>
                  Try a different name or email.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="ps-6">Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-end">Orders</TableHead>
                  <TableHead className="text-end">Spent</TableHead>
                  <TableHead>Last order</TableHead>
                  <TableHead className="pe-6">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((row) => (
                  <TableRow key={row.key}>
                    <TableCell className="ps-6">
                      <div className="flex items-center gap-3">
                        <Avatar size="sm" className="size-8">
                          <AvatarFallback className="text-xs">
                            {initials(row.name) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate font-medium">
                            {row.name}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            {row.email}
                          </span>
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {row.role === "admin" ? (
                        <Badge>Admin</Badge>
                      ) : row.kind === "account" ? (
                        <Badge variant="secondary">Account</Badge>
                      ) : (
                        <Badge variant="outline">Guest</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.joined ? formatDate(row.joined) : "—"}
                    </TableCell>
                    <TableCell className="text-end tabular-nums">
                      {row.orders}
                    </TableCell>
                    <TableCell className="text-end tabular-nums">
                      {formatPrice(row.spent)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.lastOrder ? formatDate(row.lastOrder) : "—"}
                    </TableCell>
                    <TableCell className="pe-6 text-end">
                      {row.orders > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          nativeButton={false}
                          render={
                            <Link
                              href={
                                `/admin/orders?q=${encodeURIComponent(row.email)}` as Route
                              }
                            />
                          }
                        >
                          Orders
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function AdminCustomers() {
  const { isAdmin } = useSession();
  // AdminShell handles redirects and access; wait for a confirmed admin.
  if (!isAdmin) return <AdminSkeleton />;
  return <Customers />;
}

export { AdminCustomers };
