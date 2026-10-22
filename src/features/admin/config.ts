import {
  DashboardSquare02Icon,
  PackageIcon,
  ShoppingBag02Icon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons";
import type { Route } from "next";

type AdminNavItem = {
  label: string;
  href: Route;
  icon: typeof PackageIcon;
  description: string;
};

const adminNav: AdminNavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: DashboardSquare02Icon,
    description: "Sales, orders and stock at a glance.",
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: PackageIcon,
    description: "Add, edit and remove catalogue products.",
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag02Icon,
    description: "Review orders and move them through fulfilment.",
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: UserMultipleIcon,
    description: "Accounts and guest shoppers with their order history.",
  },
];

/** The nav item for a path; `/admin` only matches exactly. */
function getActiveNavItem(pathname: string) {
  return adminNav.find((item) =>
    item.href === "/admin"
      ? pathname === "/admin"
      : pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
}

export { adminNav, getActiveNavItem, type AdminNavItem };
