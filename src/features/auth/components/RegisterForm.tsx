"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Link } from "@/components/ui/link";
import { Spinner } from "@/components/ui/spinner";
import { TextField } from "@/components/ui/text-field";
import { toast } from "@/components/ui/toast";
import { register } from "@/features/auth/api/auth-store";
import { AuthCardSkeleton } from "@/features/auth/components/AuthCardSkeleton";
import { PasswordField } from "@/features/auth/components/PasswordField";
import { SignedInNotice } from "@/features/auth/components/SignedInNotice";
import { useSession } from "@/features/auth/hooks/use-session";
import { loginHref, safeRedirect } from "@/features/auth/utils/redirect";
import {
  type FieldErrors,
  fieldErrors,
  registerSchema,
} from "@/features/auth/utils/schema";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type RegisterValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const EMPTY: RegisterValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

/** Reads `?redirect=`, so the page renders it inside Suspense. */
function RegisterForm() {
  const router = useRouter();
  const redirectTo = safeRedirect(useSearchParams().get("redirect"));
  const { user, hydrated } = useSession();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<FieldErrors<RegisterValues>>({});
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);

  if (!hydrated) return <AuthCardSkeleton />;
  if (user && !pending) {
    return <SignedInNotice user={user} continueTo={redirectTo} />;
  }

  function update(key: keyof RegisterValues, value: string) {
    const next = { ...values, [key]: value };
    setValues(next);
    // After the first submit, keep messages in sync as the user types.
    if (submitted) setErrors(fieldErrors(registerSchema, next) ?? {});
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    const invalid = fieldErrors(registerSchema, values);
    if (invalid) {
      setErrors(invalid);
      return;
    }

    setPending(true);
    const result = await register(values);
    if (!result.ok) {
      setPending(false);
      setErrors({ [result.field ?? "email"]: result.error });
      return;
    }

    toast.add({
      type: "success",
      title: "Account created",
      description: `Welcome to Northstar, ${result.user.name.split(" ")[0]}!`,
    });
    router.replace(redirectTo);
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl">Create an account</CardTitle>
        <CardDescription>
          Save your details for faster checkout and track every order.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
          <FieldGroup className="gap-5">
            <TextField
              name="name"
              idPrefix="register"
              label="Full name"
              autoComplete="name"
              value={values.name}
              onChange={(event) => update("name", event.target.value)}
              error={errors.name}
            />
            <TextField
              name="email"
              idPrefix="register"
              label="Email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(event) => update("email", event.target.value)}
              error={errors.email}
            />
            <PasswordField
              id="register-password"
              name="password"
              label="Password"
              autoComplete="new-password"
              value={values.password}
              onChange={(event) => update("password", event.target.value)}
              error={errors.password}
              description="At least 8 characters, with a letter and a number."
            />
            <PasswordField
              id="register-confirm-password"
              name="confirmPassword"
              label="Confirm password"
              autoComplete="new-password"
              value={values.confirmPassword}
              onChange={(event) =>
                update("confirmPassword", event.target.value)
              }
              error={errors.confirmPassword}
            />
          </FieldGroup>
          <Button type="submit" size="lg" disabled={pending}>
            {pending && <Spinner data-icon="inline-start" />}
            {pending ? "Creating account…" : "Create account"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Demo only — your account is stored in this browser.
          </p>
        </form>
      </CardContent>
      <CardFooter className="justify-center border-t text-sm text-muted-foreground">
        Already have an account?&nbsp;
        <Link
          href={redirectTo === "/account" ? "/login" : loginHref(redirectTo)}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </CardFooter>
    </Card>
  );
}

export { RegisterForm };
