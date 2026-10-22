"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import type { UserRole } from "@/features/auth/types";
import {
  DashboardSquare02Icon,
  PackageIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Route } from "next";
import { usePathname } from "next/navigation";

const links: { label: string; href: Route; icon: typeof UserIcon }[] = [
  { label: "Overview", href: "/account", icon: UserIcon },
  { label: "Orders", href: "/account/orders", icon: PackageIcon },
];

function AccountNav({ role }: { role: UserRole }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Account"
      className="flex flex-wrap gap-1 rounded-lg bg-muted p-1 sm:w-fit"
    >
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Button
            key={link.href}
            variant={active ? "outline" : "ghost"}
            size="sm"
            aria-current={active ? "page" : undefined}
            nativeButton={false}
            render={<Link href={link.href} />}
          >
            <HugeiconsIcon
              icon={link.icon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            {link.label}
          </Button>
        );
      })}
      {role === "admin" && (
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/admin" />}
        >
          <HugeiconsIcon
            icon={DashboardSquare02Icon}
            strokeWidth={2}
            data-icon="inline-start"
          />
          Admin
        </Button>
      )}
    </nav>
  );
}

export { AccountNav };
