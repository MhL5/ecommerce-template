"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "@/components/ui/toast";
import { logout } from "@/features/auth/api/auth-store";
import { useSession } from "@/features/auth/hooks/use-session";
import { initials } from "@/features/auth/utils/initials";
import { HeaderSearch } from "@/features/layout/components/HeaderSearch";
import { SITE_NAME, SITE_TAGLINE, mainNav } from "@/features/layout/config";
import { Menu01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Route } from "next";
import { useState } from "react";

type NavLink = { label: string; href: Route };

const shopperLinks: NavLink[] = [
  { label: "Cart", href: "/cart" },
  { label: "Wishlist", href: "/wishlist" },
];

const accountLinks: NavLink[] = [
  { label: "My account", href: "/account" },
  { label: "Order history", href: "/account/orders" },
  { label: "Addresses", href: "/account/addresses" },
];

function NavLinks({ label, links }: { label: string; links: NavLink[] }) {
  return (
    <nav aria-label={label} className="flex flex-col">
      {links.map((link) => (
        <SheetClose
          key={link.href}
          nativeButton={false}
          render={
            <Button
              variant="ghost"
              className="justify-start"
              nativeButton={false}
              render={<Link href={link.href} />}
            />
          }
        >
          {link.label}
        </SheetClose>
      ))}
    </nav>
  );
}

function MobileNav() {
  const [open, setOpen] = useState(false);
  const { user, hydrated, isAdmin } = useSession();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open menu"
          />
        }
      >
        <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} />
      </SheetTrigger>
      <SheetContent side="left" className="w-80 gap-0">
        <SheetHeader>
          <SheetTitle>{SITE_NAME}</SheetTitle>
          <SheetDescription>{SITE_TAGLINE}</SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
          {/* Submitting navigates; closing keeps the sheet out of the way. */}
          <div onSubmit={() => setOpen(false)}>
            <HeaderSearch />
          </div>
          <NavLinks label="Shop" links={mainNav} />
          <Separator />
          <NavLinks label="Your items" links={shopperLinks} />
          {user && (
            <>
              <Separator />
              <NavLinks
                label="Account"
                links={
                  isAdmin
                    ? [
                        ...accountLinks,
                        { label: "Admin panel", href: "/admin" },
                      ]
                    : accountLinks
                }
              />
            </>
          )}
        </div>
        <SheetFooter className="border-t">
          {!hydrated ? null : user ? (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">
                  {user.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout();
                  setOpen(false);
                  toast.add({ title: "Signed out" });
                }}
              >
                Sign out
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <SheetClose
                nativeButton={false}
                render={
                  <Button
                    nativeButton={false}
                    render={<Link href="/login" />}
                  />
                }
              >
                Sign in
              </SheetClose>
              <SheetClose
                nativeButton={false}
                render={
                  <Button
                    variant="outline"
                    nativeButton={false}
                    render={<Link href="/register" />}
                  />
                }
              >
                Create account
              </SheetClose>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export { MobileNav };
