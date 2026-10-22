"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatPrice } from "@/lib/format";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

// One series, so no legend: the card title names it. --chart-3 passes the
// dataviz palette checks against both the light and dark card surfaces.
const chartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-3)" },
} satisfies ChartConfig;

type RevenuePoint = { date: string; revenue: number; orders: number };

function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const total = data.reduce((sum, point) => sum + point.revenue, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue</CardTitle>
        <CardDescription>
          Last 30 days · {formatPrice(Math.round(total * 100))} excluding
          cancelled orders
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-64 w-full"
          role="img"
          aria-label={`Daily revenue for the last 30 days, ${formatPrice(Math.round(total * 100))} in total`}
        >
          <AreaChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
            <defs>
              <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.35}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={28}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(value: number) => `$${value}`}
            />
            <ChartTooltip
              cursor
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(value, _name, item) => (
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="text-muted-foreground">
                        {(item.payload as RevenuePoint).orders} orders
                      </span>
                      <span className="font-medium text-foreground tabular-nums">
                        {formatPrice(Math.round(Number(value) * 100))}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Area
              dataKey="revenue"
              type="monotone"
              stroke="var(--color-revenue)"
              strokeWidth={2}
              fill="url(#revenue-fill)"
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export { RevenueChart, type RevenuePoint };
