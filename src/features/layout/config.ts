import type { Route } from "next";

const SITE_NAME = "Northstar";
const SITE_TAGLINE = "Well-made goods for everyday life";

type NavLink = { label: string; href: Route };

const mainNav: NavLink[] = [
  { label: "Shop all", href: "/products" },
  { label: "New in", href: "/products?sort=newest" as Route },
  { label: "Electronics", href: "/products?category=electronics" as Route },
  { label: "Clothing", href: "/products?category=clothing" as Route },
  { label: "Home", href: "/products?category=home-kitchen" as Route },
  { label: "Deals", href: "/products?sale=1" as Route },
];

export { mainNav, SITE_NAME, SITE_TAGLINE, type NavLink };
