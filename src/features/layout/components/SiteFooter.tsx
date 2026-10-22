import { Link } from "@/components/ui/link";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/features/layout/components/Logo";
import { PageContainer } from "@/features/layout/components/PageContainer";
import { SITE_NAME, SITE_TAGLINE } from "@/features/layout/config";
import { getCategories } from "@/features/products/api";
import { productsHref } from "@/features/products/utils/query";
import type { Route } from "next";

const accountLinks: { label: string; href: Route }[] = [
  { label: "Sign in", href: "/login" },
  { label: "Create account", href: "/register" },
  { label: "My account", href: "/account" },
  { label: "Order history", href: "/account/orders" },
  { label: "Cart", href: "/cart" },
];

const helpItems = [
  "Free shipping over $75",
  "30-day returns",
  "2-year warranty",
  "Support: Mon–Fri, 9–5",
];

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-medium">{title}</h2>
      <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
        {children}
      </ul>
    </div>
  );
}

const linkClassName =
  "rounded-sm outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50";

function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-muted/40">
      <PageContainer className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="flex max-w-xs flex-col gap-3">
          <Logo />
          <p className="text-sm text-muted-foreground">{SITE_TAGLINE}.</p>
        </div>
        <FooterColumn title="Shop">
          {getCategories().map((category) => (
            <li key={category.id}>
              <Link
                href={productsHref({ categories: [category.id] })}
                className={linkClassName}
              >
                {category.name}
              </Link>
            </li>
          ))}
        </FooterColumn>
        <FooterColumn title="Account">
          {accountLinks.map((link) => (
            <li key={link.label}>
              <Link href={link.href} className={linkClassName}>
                {link.label}
              </Link>
            </li>
          ))}
        </FooterColumn>
        <FooterColumn title="Help">
          {helpItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </FooterColumn>
      </PageContainer>
      <Separator />
      <PageContainer className="flex flex-col gap-2 py-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
        <p>
          © 2026 {SITE_NAME}. A demo store — products are fictional and no
          payments are taken.
        </p>
        <p>
          Press <kbd className="font-mono">D</kbd> to toggle dark mode.
        </p>
      </PageContainer>
    </footer>
  );
}

export { SiteFooter };
