import type {
  Order,
  OrderStatus,
  OrderStatusEvent,
} from "@/features/orders/types";

const HOUR = 3_600_000;

/**
 * Plausible history for a static seed order, matching the events the DB
 * seed writes: shipped a day after it's placed, delivered three days later,
 * cancelled within hours.
 */
function seedStatusHistory(
  status: OrderStatus,
  createdAt: string,
): OrderStatusEvent[] {
  const placed = Date.parse(createdAt);
  const at = (hours: number) => new Date(placed + hours * HOUR).toISOString();
  if (status === "cancelled") return [{ status, at: at(3) }];
  const events: OrderStatusEvent[] = [];
  if (status === "shipped" || status === "delivered")
    events.push({ status: "shipped", at: at(26) });
  if (status === "delivered")
    events.push({ status: "delivered", at: at(26 + 72) });
  return events;
}

type TimelineStep = {
  status: OrderStatus;
  label: string;
  /** When it happened; missing for steps not reached yet. */
  at?: string;
  done: boolean;
};

const stepLabels: Record<OrderStatus, string> = {
  processing: "Order placed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** Placed → shipped → delivered, or placed → cancelled. */
function getOrderTimeline(order: Order): TimelineStep[] {
  const reachedAt = (status: OrderStatus) =>
    order.statusHistory?.findLast((event) => event.status === status)?.at;
  const path: OrderStatus[] =
    order.status === "cancelled"
      ? ["processing", "cancelled"]
      : ["processing", "shipped", "delivered"];
  const currentIndex = path.indexOf(order.status);

  return path.map((status, index) => ({
    status,
    label: stepLabels[status],
    at: status === "processing" ? order.createdAt : reachedAt(status),
    done: index <= currentIndex,
  }));
}

export { getOrderTimeline, seedStatusHistory, type TimelineStep };
