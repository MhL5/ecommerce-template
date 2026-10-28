import type { Order } from "@/features/orders/types";
import { getOrderTimeline } from "@/features/orders/utils/timeline";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

/** Where the order is on its way, with the date of each step reached. */
function OrderTimeline({ order }: { order: Order }) {
  const steps = getOrderTimeline(order);

  return (
    <ol aria-label="Order progress" className="flex">
      {steps.map((step, index) => {
        const cancelled = step.status === "cancelled";
        return (
          <li
            key={step.status}
            aria-current={step.status === order.status ? "step" : undefined}
            className="relative flex flex-1 flex-col items-center gap-2 text-center"
          >
            {index > 0 && (
              <span
                aria-hidden
                className={cn(
                  "absolute end-1/2 top-3 h-0.5 w-full -translate-y-1/2",
                  step.done ? "bg-primary" : "bg-border",
                  cancelled && "bg-destructive/40",
                )}
              />
            )}
            <span
              className={cn(
                "relative flex size-6 items-center justify-center rounded-full border-2 bg-background",
                step.done
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border",
                cancelled &&
                  "border-destructive bg-background text-destructive",
              )}
            >
              {step.done && (
                <HugeiconsIcon
                  icon={cancelled ? Cancel01Icon : Tick02Icon}
                  strokeWidth={2.5}
                  className="size-3.5"
                />
              )}
            </span>
            <span className="flex flex-col">
              <span
                className={cn(
                  "text-xs font-medium",
                  !step.done && "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {step.at ? formatDate(step.at) : step.done ? "" : "Pending"}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export { OrderTimeline };
