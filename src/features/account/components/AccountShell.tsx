"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { AccountNav } from "@/features/account/components/AccountNav";
import { useRequireAuth } from "@/features/auth/hooks/use-require-auth";
import type { ReactNode } from "react";

/**
 * Shared header + nav for /account pages. Always renders `children`; pages
 * show their own skeleton until the session is known.
 */
function AccountShell({ children }: { children: ReactNode }) {
  const { user } = useRequireAuth();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        {user ? (
          <h1 className="text-3xl font-semibold tracking-tight">
            Hi, {user.name.split(" ")[0]}
          </h1>
        ) : (
          <Skeleton className="h-9 w-48" />
        )}
        <p className="text-muted-foreground">
          Manage your details and keep track of your orders.
        </p>
      </header>
      <AccountNav role={user?.role ?? "customer"} />
      {children}
    </div>
  );
}

export { AccountShell };
