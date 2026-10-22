import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/features/orders/types";

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const variants = {
  processing: "outline",
  shipped: "default",
  delivered: "secondary",
  cancelled: "destructive",
} as const satisfies Record<OrderStatus, string>;

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant={variants[status]}>{ORDER_STATUS_LABELS[status]}</Badge>
  );
}

export { ORDER_STATUS_LABELS, OrderStatusBadge };
