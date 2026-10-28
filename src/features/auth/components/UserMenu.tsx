"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/components/ui/link";
import { toast } from "@/components/ui/toast";
import { logout } from "@/features/auth/api/auth-store";
import { useSession } from "@/features/auth/hooks/use-session";
import { initials } from "@/features/auth/utils/initials";
import {
  DashboardSquare02Icon,
  Location01Icon,
  Logout03Icon,
  PackageIcon,
  UserCircleIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";

/** Sign-in link when signed out; account dropdown when signed in. */
function UserMenu() {
  const { user, hydrated, isAdmin } = useSession();
  const router = useRouter();

  if (!hydrated || !user) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Sign in"
        nativeButton={false}
        render={<Link href="/login" />}
      >
        <HugeiconsIcon icon={UserCircleIcon} strokeWidth={2} />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label={`Account menu for ${user.name}`}
          />
        }
      >
        <Avatar size="sm" className="size-7">
          <AvatarFallback className="bg-primary text-xs text-primary-foreground">
            {initials(user.name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="truncate text-sm text-foreground">
              {user.name}
            </span>
            <span className="truncate font-normal">{user.email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/account" />}>
            <HugeiconsIcon icon={UserIcon} strokeWidth={2} />
            My account
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/account/orders" />}>
            <HugeiconsIcon icon={PackageIcon} strokeWidth={2} />
            Orders
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/account/addresses" />}>
            <HugeiconsIcon icon={Location01Icon} strokeWidth={2} />
            Addresses
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem render={<Link href="/admin" />}>
              <HugeiconsIcon icon={DashboardSquare02Icon} strokeWidth={2} />
              Admin panel
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              logout();
              toast.add({ title: "Signed out", description: "See you soon." });
              router.push("/");
            }}
          >
            <HugeiconsIcon icon={Logout03Icon} strokeWidth={2} />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { UserMenu };
