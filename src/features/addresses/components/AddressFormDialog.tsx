"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TextField } from "@/components/ui/text-field";
import { toast } from "@/components/ui/toast";
import { saveAddress } from "@/features/addresses/api/address-store";
import type { SavedAddress } from "@/features/addresses/types";
import {
  type AddressErrors,
  validateAddress,
} from "@/features/addresses/utils/schema";
import { AddressFields } from "@/features/checkout/components/AddressFields";
import { useState } from "react";

type AddressFormDialogProps = {
  userId: string;
  /** Edits this address; adds a new one when missing. */
  address?: SavedAddress;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formValues(form: HTMLFormElement) {
  return Object.fromEntries(
    [...new FormData(form).entries()].map(([key, value]) => [
      key,
      typeof value === "string" ? value : "",
    ]),
  );
}

function AddressFormDialog({
  userId,
  address,
  open,
  onOpenChange,
}: AddressFormDialogProps) {
  const [errors, setErrors] = useState<AddressErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (next) {
      setErrors({});
      setSubmitted(false);
    }
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    const form = event.currentTarget;
    const result = validateAddress(formValues(form));
    if (!result.success) {
      setErrors(result.errors);
      requestAnimationFrame(() => {
        form.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
      });
      return;
    }
    saveAddress(userId, result.data, address?.id);
    onOpenChange(false);
    toast.add({
      type: "success",
      title: address ? "Address updated" : "Address saved",
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <form
          noValidate
          className="flex min-h-0 flex-col gap-6"
          onSubmit={onSubmit}
          onChange={(event) => {
            if (!submitted) return;
            const result = validateAddress(formValues(event.currentTarget));
            setErrors(result.success ? {} : result.errors);
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {address ? "Edit address" : "New address"}
            </DialogTitle>
            <DialogDescription>
              Saved addresses can be picked at checkout.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="-mx-6 max-h-[60vh] px-6">
            <FieldGroup className="gap-5 pb-1">
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  name="label"
                  idPrefix="address"
                  label="Nickname (optional)"
                  placeholder="Home, Work…"
                  defaultValue={address?.label}
                  error={errors.label}
                />
                <TextField
                  name="phone"
                  idPrefix="address"
                  label="Phone (optional)"
                  type="tel"
                  autoComplete="tel"
                  defaultValue={address?.phone}
                  error={errors.phone}
                />
              </div>
              <AddressFields errors={errors} defaults={address ?? {}} />
            </FieldGroup>
          </ScrollArea>
          <DialogFooter>
            <Button type="submit">
              {address ? "Save changes" : "Save address"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { AddressFormDialog };
