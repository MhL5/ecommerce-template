import { PageContainer } from "@/features/layout/components/PageContainer";
import { WishlistView } from "@/features/wishlist/components/WishlistView";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return (
    <PageContainer className="flex flex-col gap-8 py-8 sm:py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Wishlist</h1>
        <p className="text-muted-foreground">
          Products you’ve saved. Stored in this browser — no account needed.
        </p>
      </header>
      <WishlistView />
    </PageContainer>
  );
}
