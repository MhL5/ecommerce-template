"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/components/ui/link";
import { logout } from "@/features/auth/api/auth-store";
import type { PublicUser } from "@/features/auth/types";
import type { Route } from "next";

/** Shown on /login and /register when someone is already signed in. */
function SignedInNotice({
  user,
  continueTo,
}: {
  user: PublicUser;
  continueTo: Route;
}) {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>You’re already signed in</CardTitle>
        <CardDescription>
          Signed in as {user.name} ({user.email}).
        </CardDescription>
      </CardHeader>
      <CardFooter className="gap-3">
        <Button nativeButton={false} render={<Link href={continueTo} />}>
          Continue
        </Button>
        <Button variant="outline" onClick={() => logout()}>
          Sign out
        </Button>
      </CardFooter>
    </Card>
  );
}

export { SignedInNotice };
