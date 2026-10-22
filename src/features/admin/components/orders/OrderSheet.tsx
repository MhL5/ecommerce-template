"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "@/components/ui/toast";
import { STATUS_FLOW, setOrderStatus } from "@/features/orders/api/order-store";
import { OrderDetails } from "@/features/orders/components/OrderDetails";
import {
  ORDER_STATUS_LABELS,
  OrderStatusBadge,
} from "@/features/orders/components/OrderStatusBadge";
import type { Order, OrderStatus } from "@/features/orders/types";
import { formatDate } from "@/lib/format";
import { useState } from "react";

const actionLabels: Partial<Record<OrderStatus, string>> = {
  shipped: "Mark as shipped",
  delivered: "Mark as delivered",
};

function CancelButton({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="destructive" />}>
        Cancel order
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel {order.number}?</AlertDialogTitle>
          <AlertDialogDescription>
            The customer sees it as cancelled and the items go back into stock.
            This can’t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep order</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              setOrderStatus(order, "cancelled");
              setOpen(false);
              toast.add({
                title: "Order cancelled",
                description: order.number,
              });
            }}
          >
            Cancel order
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Order detail with the next fulfilment steps the status flow allows. */
function OrderSheet({
  order,
  open,
  onOpenChange,
}: {
  order: Order | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open && !!order} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 sm:max-w-2xl">
        {order && (
          <>
            <SheetHeader className="border-b">
              <div className="flex items-center gap-2 pe-8">
                <SheetTitle>Order {order.number}</SheetTitle>
                <OrderStatusBadge status={order.status} />
              </div>
              <SheetDescription>
                Placed {formatDate(order.createdAt)} by{" "}
                {order.shippingAddress.firstName}{" "}
                {order.shippingAddress.lastName} ({order.email})
                {order.userId ? "" : " · guest checkout"}
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="min-h-0 flex-1">
              <div className="flex flex-col gap-6 p-4">
                <OrderDetails order={order} />
                <Separator />
                <div className="flex flex-col gap-1 text-sm">
                  <span className="font-medium">Fulfilment</span>
                  <span className="text-muted-foreground">
                    Processing → Shipped → Delivered. Orders can be cancelled
                    until they ship.
                  </span>
                </div>
              </div>
            </ScrollArea>
            <SheetFooter className="flex-row flex-wrap justify-end border-t">
              {STATUS_FLOW[order.status].length === 0 ? (
                <p className="me-auto self-center text-sm text-muted-foreground">
                  {ORDER_STATUS_LABELS[order.status]} — nothing left to do.
                </p>
              ) : (
                STATUS_FLOW[order.status].map((next) =>
                  next === "cancelled" ? (
                    <CancelButton key={next} order={order} />
                  ) : (
                    <Button
                      key={next}
                      onClick={() => {
                        setOrderStatus(order, next);
                        toast.add({
                          type: "success",
                          title: `Marked as ${ORDER_STATUS_LABELS[next].toLowerCase()}`,
                          description: order.number,
                        });
                      }}
                    >
                      {actionLabels[next]}
                    </Button>
                  ),
                )
              )}
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export { OrderSheet };
