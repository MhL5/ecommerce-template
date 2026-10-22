import type { Order, OrderStatus } from "@/features/orders/types";

const DAY = 86_400_000;

/** Revenue counts every order except cancelled ones. */
function isCounted(order: Order) {
  return order.status !== "cancelled";
}

function startOfDay(time: number) {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function inWindow(order: Order, from: number, to: number) {
  const time = new Date(order.createdAt).getTime();
  return time >= from && time < to;
}

type PeriodStats = { revenue: number; orders: number; average: number };

function periodStats(orders: Order[], from: number, to: number): PeriodStats {
  const inPeriod = orders.filter(
    (order) => isCounted(order) && inWindow(order, from, to),
  );
  const revenue = inPeriod.reduce((sum, order) => sum + order.totals.total, 0);
  return {
    revenue,
    orders: inPeriod.length,
    average: inPeriod.length ? Math.round(revenue / inPeriod.length) : 0,
  };
}

/** Percent change, or null when there's nothing to compare against. */
function change(current: number, previous: number) {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

/** Last `days` days (ending today) vs the `days` before that. */
function getKpis(orders: Order[], now: number, days = 30) {
  const end = startOfDay(now) + DAY;
  const start = end - days * DAY;
  const current = periodStats(orders, start, end);
  const previous = periodStats(orders, start - days * DAY, start);
  const customers = new Set(orders.map((order) => order.email.toLowerCase()));
  const newCustomers = new Set(
    orders
      .filter((order) => inWindow(order, start, end))
      .map((order) => order.email.toLowerCase()),
  );

  return {
    revenue: {
      value: current.revenue,
      change: change(current.revenue, previous.revenue),
    },
    orders: {
      value: current.orders,
      change: change(current.orders, previous.orders),
    },
    average: {
      value: current.average,
      change: change(current.average, previous.average),
    },
    customers: { value: customers.size, active: newCustomers.size },
  };
}

/** One point per day for the last `days` days; revenue in dollars. */
function getDailyRevenue(orders: Order[], now: number, days = 30) {
  const end = startOfDay(now) + DAY;
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });

  return Array.from({ length: days }, (_, index) => {
    const from = end - (days - index) * DAY;
    const dayOrders = orders.filter(
      (order) => isCounted(order) && inWindow(order, from, from + DAY),
    );
    return {
      date: formatter.format(new Date(from)),
      revenue:
        dayOrders.reduce((sum, order) => sum + order.totals.total, 0) / 100,
      orders: dayOrders.length,
    };
  });
}

function getStatusCounts(orders: Order[]) {
  const counts: Record<OrderStatus, number> = {
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };
  for (const order of orders) counts[order.status]++;
  return counts;
}

/** Best sellers by units across non-cancelled orders. */
function getTopProducts(orders: Order[], limit = 5) {
  const totals = new Map<
    string,
    {
      productId: string;
      name: string;
      image: string;
      units: number;
      revenue: number;
    }
  >();
  for (const order of orders.filter(isCounted)) {
    for (const line of order.items) {
      const entry = totals.get(line.productId) ?? {
        productId: line.productId,
        name: line.name,
        image: line.image,
        units: 0,
        revenue: 0,
      };
      entry.units += line.quantity;
      entry.revenue += line.price * line.quantity;
      totals.set(line.productId, entry);
    }
  }
  return [...totals.values()]
    .sort((a, b) => b.units - a.units || b.revenue - a.revenue)
    .slice(0, limit);
}

export { getDailyRevenue, getKpis, getStatusCounts, getTopProducts };
