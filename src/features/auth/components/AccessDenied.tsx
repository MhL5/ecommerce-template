"use client";

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
import { logout } from "@/features/auth/api/auth-store";
import type { PublicUser, UserRole } from "@/features/auth/types";
import { SquareLock02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

/** Shown to a signed-in user who lacks the role a page needs. */
function AccessDenied({ user, role }: { user: PublicUser; role: UserRole }) {
  return (
    <Empty className="border border-dashed py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={SquareLock02Icon} strokeWidth={2} />
        </EmptyMedia>
        <EmptyTitle>You don’t have access to this page</EmptyTitle>
        <EmptyDescription>
          You’re signed in as {user.email}, which isn’t an {role} account. Sign
          in with the demo admin account to continue.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center">
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/" />}
        >
          Go home
        </Button>
        {/* Signing out makes the page's auth hook redirect to /login. */}
        <Button onClick={() => logout()}>Switch account</Button>
      </EmptyContent>
    </Empty>
  );
}

export { AccessDenied };
