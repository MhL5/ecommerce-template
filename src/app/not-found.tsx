import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Link } from "@/components/ui/link";
import { PageContainer } from "@/features/layout/components/PageContainer";
import { ShopShell } from "@/features/layout/components/ShopShell";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    // The root 404 sits outside the (shop) group, so it brings the shop chrome.
    <ShopShell>
      <PageContainer className="flex flex-1 items-center py-16">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
            </EmptyMedia>
            <EmptyTitle>We couldn’t find that page</EmptyTitle>
            <EmptyDescription>
              The link may be broken or the product may no longer be available.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center">
            <Button nativeButton={false} render={<Link href="/products" />}>
              Browse products
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/" />}
            >
              Go home
            </Button>
          </EmptyContent>
        </Empty>
      </PageContainer>
    </ShopShell>
  );
}
