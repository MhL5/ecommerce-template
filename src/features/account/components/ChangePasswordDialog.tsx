"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { changePassword } from "@/features/auth/api/auth-store";
import { PasswordField } from "@/features/auth/components/PasswordField";
import type { PublicUser } from "@/features/auth/types";
import {
  type FieldErrors,
  changePasswordSchema,
  fieldErrors,
} from "@/features/auth/utils/schema";
import { useState } from "react";

type Values = {
  currentPassword: string;
  password: string;
  confirmPassword: string;
};

const EMPTY: Values = {
  currentPassword: "",
  password: "",
  confirmPassword: "",
};

function ChangePasswordDialog({ user }: { user: PublicUser }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<FieldErrors<Values>>({});
  const [pending, setPending] = useState(false);

  function update(key: keyof Values, value: string) {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const invalid = fieldErrors(changePasswordSchema, values);
    if (invalid) {
      setErrors(invalid);
      return;
    }
    setPending(true);
    const result = await changePassword(
      user.id,
      values.currentPassword,
      values.password,
    );
    setPending(false);
    if (!result.ok) {
      setErrors({ currentPassword: result.error });
      return;
    }
    setOpen(false);
    toast.add({ type: "success", title: "Password changed" });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return;
        setOpen(next);
        if (next) {
          setValues(EMPTY);
          setErrors({});
        }
      }}
    >
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        Change password
      </DialogTrigger>
      <DialogContent>
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>
              You’ll use the new password next time you sign in.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="gap-5">
            <PasswordField
              id="current-password"
              label="Current password"
              autoComplete="current-password"
              value={values.currentPassword}
              onChange={(event) =>
                update("currentPassword", event.target.value)
              }
              error={errors.currentPassword}
            />
            <PasswordField
              id="new-password"
              label="New password"
              autoComplete="new-password"
              value={values.password}
              onChange={(event) => update("password", event.target.value)}
              error={errors.password}
              description="At least 8 characters, with a letter and a number."
            />
            <PasswordField
              id="confirm-new-password"
              label="Confirm new password"
              autoComplete="new-password"
              value={values.confirmPassword}
              onChange={(event) =>
                update("confirmPassword", event.target.value)
              }
              error={errors.confirmPassword}
            />
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending && <Spinner data-icon="inline-start" />}
              {pending ? "Saving…" : "Update password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { ChangePasswordDialog };
