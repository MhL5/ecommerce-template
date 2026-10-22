import type { PublicUser } from "@/features/auth/types";
import type { Order } from "@/features/orders/types";

type CustomerRow = {
  key: string;
  name: string;
  email: string;
  kind: "account" | "guest";
  role: PublicUser["role"] | null;
  joined: string | null;
  orders: number;
  /** Cents, excluding cancelled orders. */
  spent: number;
  lastOrder: string | null;
};

/**
 * One row per account plus one per guest email. Orders are matched to an
 * account by user id or by email (guest checkouts with an account's email).
 */
function buildCustomerRows(
  users: PublicUser[],
  orders: Order[],
): CustomerRow[] {
  const rows = new Map<string, CustomerRow>();

  for (const user of users) {
    rows.set(user.email.toLowerCase(), {
      key: user.id,
      name: user.name,
      email: user.email,
      kind: "account",
      role: user.role,
      joined: user.createdAt,
      orders: 0,
      spent: 0,
      lastOrder: null,
    });
  }

  const byId = new Map(
    users.map((user) => [user.id, user.email.toLowerCase()]),
  );

  for (const order of orders) {
    const email =
      (order.userId && byId.get(order.userId)) || order.email.toLowerCase();
    let row = rows.get(email);
    if (!row) {
      row = {
        key: `guest:${email}`,
        name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`.trim(),
        email: order.email,
        kind: "guest",
        role: null,
        joined: null,
        orders: 0,
        spent: 0,
        lastOrder: null,
      };
      rows.set(email, row);
    }
    row.orders++;
    if (order.status !== "cancelled") row.spent += order.totals.total;
    if (!row.lastOrder || order.createdAt > row.lastOrder) {
      row.lastOrder = order.createdAt;
    }
  }

  return [...rows.values()].sort(
    (a, b) => b.spent - a.spent || a.name.localeCompare(b.name),
  );
}

export { buildCustomerRows, type CustomerRow };
