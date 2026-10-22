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
import { TextField } from "@/components/ui/text-field";
import { toast } from "@/components/ui/toast";
import { updateProfile } from "@/features/auth/api/auth-store";
import type { PublicUser } from "@/features/auth/types";
import { useState } from "react";

function EditProfileDialog({ user }: { user: PublicUser }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user.name);
  const [error, setError] = useState<string | undefined>();

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        // Start from the saved name each time the dialog opens.
        if (next) {
          setName(user.name);
          setError(undefined);
        }
      }}
    >
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        Edit profile
      </DialogTrigger>
      <DialogContent>
        <form
          noValidate
          className="flex flex-col gap-6"
          onSubmit={(event) => {
            event.preventDefault();
            if (name.trim().length < 2) {
              setError("Enter your full name");
              return;
            }
            updateProfile(user.id, { name });
            setOpen(false);
            toast.add({ type: "success", title: "Profile updated" });
          }}
        >
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Your name appears on orders and in the header.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="gap-5">
            <TextField
              name="name"
              idPrefix="profile"
              label="Full name"
              autoComplete="name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError(undefined);
              }}
              error={error}
            />
            <TextField
              name="email"
              idPrefix="profile"
              label="Email"
              value={user.email}
              disabled
              description="Email is your sign-in and links your orders, so it can’t be changed in this demo."
            />
          </FieldGroup>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { EditProfileDialog };
