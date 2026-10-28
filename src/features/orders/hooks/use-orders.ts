import type { PublicUser } from "@/features/auth/types";
import { seedOrders } from "@/features/orders/api/data/seed-orders";
import { orderStore, statusStore } from "@/features/orders/api/order-store";
import type { Order } from "@/features/orders/types";
import { useHydrated } from "@/hooks/use-hydrated";

/**
 * Every order known to this browser — placed here plus the static seed
 * history — with status changes applied, newest first.
 */
function useAllOrders() {
  const { orders } = orderStore.useStore();
  const statuses = statusStore.useStore();
  const hydrated = useHydrated();

  const all = [...orders, ...seedOrders]
    .map((order) => {
      const update = statuses[order.id];
      return update
        ? {
            ...order,
            status: update.status,
            statusHistory: [...(order.statusHistory ?? []), ...update.history],
          }
        : order;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return { orders: all, hydrated };
}

function useOrder(id: string | null) {
  const { orders, hydrated } = useAllOrders();
  return {
    order: id ? orders.find((order) => order.id === id) : undefined,
    hydrated,
  };
}

/**
 * Orders belonging to a user: placed while signed in, or as a guest with the
 * same email. Newest first.
 */
function useUserOrders(user: PublicUser): Order[] {
  const { orders } = useAllOrders();
  const email = user.email.toLowerCase();
  return orders.filter(
    (order) => order.userId === user.id || order.email.toLowerCase() === email,
  );
}

export { useAllOrders, useOrder, useUserOrders };
