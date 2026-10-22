"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup, FieldSeparator } from "@/components/ui/field";
import { Link } from "@/components/ui/link";
import { Spinner } from "@/components/ui/spinner";
import { TextField } from "@/components/ui/text-field";
import { toast } from "@/components/ui/toast";
import { login } from "@/features/auth/api/auth-store";
import { DEMO_ACCOUNTS } from "@/features/auth/api/data/users";
import { AuthCardSkeleton } from "@/features/auth/components/AuthCardSkeleton";
import { PasswordField } from "@/features/auth/components/PasswordField";
import { SignedInNotice } from "@/features/auth/components/SignedInNotice";
import { useSession } from "@/features/auth/hooks/use-session";
import { safeRedirect } from "@/features/auth/utils/redirect";
import {
  type FieldErrors,
  fieldErrors,
  loginSchema,
} from "@/features/auth/utils/schema";
import { Alert02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type LoginValues = { email: string; password: string };

/** Reads `?redirect=`, so the page renders it inside Suspense. */
function LoginForm() {
  const router = useRouter();
  const redirectTo = safeRedirect(useSearchParams().get("redirect"));
  const { user, hydrated } = useSession();
  const [values, setValues] = useState<LoginValues>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FieldErrors<LoginValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!hydrated) return <AuthCardSkeleton />;
  // Keep the form up while a successful login is redirecting.
  if (user && !pending) {
    return <SignedInNotice user={user} continueTo={redirectTo} />;
  }

  function update(key: keyof LoginValues, value: string) {
    setValues((previous) => ({ ...previous, [key]: value }));
    if (errors[key])
      setErrors((previous) => ({ ...previous, [key]: undefined }));
    setFormError(null);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const invalid = fieldErrors(loginSchema, values);
    if (invalid) {
      setErrors(invalid);
      return;
    }

    setPending(true);
    const result = await login(values.email, values.password);
    if (!result.ok) {
      setPending(false);
      setFormError(result.error);
      return;
    }

    toast.add({
      type: "success",
      title: `Welcome back, ${result.user.name.split(" ")[0]}`,
    });
    const destination: Route =
      result.user.role === "admin" && redirectTo === "/account"
        ? "/admin"
        : redirectTo;
    router.replace(destination);
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl">Sign in</CardTitle>
        <CardDescription>
          Welcome back. Sign in to see your orders and check out faster.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
          {formError && (
            <Alert variant="destructive">
              <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
              <AlertTitle>Couldn’t sign you in</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          <FieldGroup className="gap-5">
            <TextField
              name="email"
              idPrefix="login"
              label="Email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(event) => update("email", event.target.value)}
              error={errors.email}
            />
            <PasswordField
              id="login-password"
              name="password"
              label="Password"
              autoComplete="current-password"
              value={values.password}
              onChange={(event) => update("password", event.target.value)}
              error={errors.password}
            />
          </FieldGroup>
          <Button type="submit" size="lg" disabled={pending}>
            {pending && <Spinner data-icon="inline-start" />}
            {pending ? "Signing in…" : "Sign in"}
          </Button>

          <FieldSeparator>Demo accounts</FieldSeparator>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => {
                setValues({ ...DEMO_ACCOUNTS.customer });
                setErrors({});
                setFormError(null);
              }}
            >
              Fill customer
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => {
                setValues({ ...DEMO_ACCOUNTS.admin });
                setErrors({});
                setFormError(null);
              }}
            >
              Fill admin
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="justify-center border-t text-sm text-muted-foreground">
        New here?&nbsp;
        <Link
          href={
            redirectTo === "/account"
              ? "/register"
              : (`/register?redirect=${encodeURIComponent(redirectTo)}` as Route)
          }
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </CardFooter>
    </Card>
  );
}

export { LoginForm };
