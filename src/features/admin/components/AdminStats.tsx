import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { getInventoryStats } from "@/features/admin/utils/stats";
import { formatPrice } from "@/lib/format";

type Stats = ReturnType<typeof getInventoryStats>;

function StatCard({
  label,
  value,
  footnote,
}: {
  label: string;
  value: string;
  footnote: string;
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      <CardFooter className="text-xs text-muted-foreground">
        {footnote}
      </CardFooter>
    </Card>
  );
}

function AdminStats({ stats }: { stats: Stats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Products"
        value={String(stats.total)}
        footnote={`${stats.onSale} currently on sale`}
      />
      <StatCard
        label="Inventory value"
        value={formatPrice(stats.inventoryValue)}
        footnote={`${stats.units.toLocaleString("en-US")} units at retail price`}
      />
      <StatCard
        label="Low stock"
        value={String(stats.lowStock)}
        footnote="10 or fewer units left"
      />
      <StatCard
        label="Out of stock"
        value={String(stats.outOfStock)}
        footnote="Hidden from “In stock only”"
      />
    </div>
  );
}

export { AdminStats };
