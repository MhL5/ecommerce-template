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
import { toast } from "@/components/ui/toast";
import {
  canCustomerCancel,
  setOrderStatus,
} from "@/features/orders/api/order-store";
import type { Order } from "@/features/orders/types";
import { useState } from "react";

/** Lets a customer cancel an order that hasn't shipped yet. */
function CancelOrderButton({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);

  if (!canCustomerCancel(order)) return null;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
        Cancel order
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel order {order.number}?</AlertDialogTitle>
          <AlertDialogDescription>
            It hasn’t shipped yet, so you can still cancel. This is a demo, so
            there’s no refund to wait for — the items just go back in stock.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep order</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              if (setOrderStatus(order, "cancelled")) {
                toast.add({
                  title: "Order cancelled",
                  description: order.number,
                });
              }
              setOpen(false);
            }}
          >
            Cancel order
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { CancelOrderButton };
