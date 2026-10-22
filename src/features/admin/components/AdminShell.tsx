"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/features/admin/components/AdminSidebar";
import { AdminTopbar } from "@/features/admin/components/AdminTopbar";
import { AccessDenied } from "@/features/auth/components/AccessDenied";
import { useRequireAuth } from "@/features/auth/hooks/use-require-auth";
import type { ReactNode } from "react";

/**
 * Full-screen admin layout: sidebar + top bar. Signed-out visitors go to
 * /login, non-admins see an access notice. Otherwise `children` always
 * render (pages show a skeleton until the admin session is confirmed), so
 * Next can prerender and validate each page segment.
 */
function AdminShell({ children }: { children: ReactNode }) {
  const { user, status } = useRequireAuth("admin");

  return (
    <SidebarProvider>
      <AdminSidebar user={status === "authorized" ? user : null} />
      <SidebarInset className="min-w-0">
        <AdminTopbar />
        <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
          {status === "forbidden" && user ? (
            <AccessDenied user={user} role="admin" />
          ) : (
            children
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export { AdminShell };
