"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getActiveNavItem } from "@/features/admin/config";
import { ThemeToggle } from "@/features/layout/components/ThemeToggle";
import { Store01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { usePathname } from "next/navigation";

function AdminTopbar() {
  const pathname = usePathname();
  const active = getActiveNavItem(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur-md">
      <SidebarTrigger className="-ms-1" />
      <Separator orientation="vertical" className="me-1 h-5" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden sm:inline-flex">
            <BreadcrumbLink render={<Link href="/admin" />}>
              Admin
            </BreadcrumbLink>
          </BreadcrumbItem>
          {active && active.href !== "/admin" && (
            <>
              <BreadcrumbSeparator className="hidden sm:flex" />
              <BreadcrumbItem>
                <BreadcrumbPage>{active.label}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
          {active?.href === "/admin" && (
            <>
              <BreadcrumbSeparator className="hidden sm:flex" />
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ms-auto flex items-center gap-1">
        <ThemeToggle />
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/" />}
        >
          <HugeiconsIcon
            icon={Store01Icon}
            strokeWidth={2}
            data-icon="inline-start"
          />
          View store
        </Button>
      </div>
    </header>
  );
}

export { AdminTopbar };
