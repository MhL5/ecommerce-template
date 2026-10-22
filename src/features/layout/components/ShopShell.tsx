import { SiteFooter } from "@/features/layout/components/SiteFooter";
import { SiteHeader } from "@/features/layout/components/SiteHeader";
import type { ReactNode } from "react";

/** Header + main + footer around every shop page (and the 404 page). */
function ShopShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter />
    </>
  );
}

export { ShopShell };
