"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { TextField } from "@/components/ui/text-field";
import { toast } from "@/components/ui/toast";
import {
  type DiscountFormErrors,
  type DiscountFormValues,
  toFormValues,
  validateDiscountForm,
} from "@/features/admin/utils/discount-form";
import { saveDiscountCode } from "@/features/checkout/api/discount-store";
import type { DiscountCode, DiscountKind } from "@/features/checkout/types";
import { useState } from "react";

const kindItems: { value: DiscountKind; label: string }[] = [
  { value: "percent", label: "Percentage off" },
  { value: "fixed", label: "Fixed amount off" },
  { value: "free-shipping", label: "Free shipping" },
];

function AddonField({
  name,
  label,
  prefix,
  suffix,
  value,
  error,
  description,
  onChange,
}: {
  name: keyof DiscountFormValues;
  label: string;
  prefix?: string;
  suffix?: string;
  value: string;
  error?: string;
  description?: string;
  onChange: (value: string) => void;
}) {
  const id = `discount-${name}`;
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputGroup>
        {prefix && (
          <InputGroupAddon>
            <InputGroupText>{prefix}</InputGroupText>
          </InputGroupAddon>
        )}
        <InputGroupInput
          id={id}
          inputMode="decimal"
          value={value}
          aria-invalid={!!error}
          onChange={(event) => onChange(event.target.value)}
        />
        {suffix && (
          <InputGroupAddon align="inline-end">
            <InputGroupText>{suffix}</InputGroupText>
          </InputGroupAddon>
        )}
      </InputGroup>
      {error ? (
        <FieldError>{error}</FieldError>
      ) : (
        description && <FieldDescription>{description}</FieldDescription>
      )}
    </Field>
  );
}

type DiscountFormSheetProps = {
  /** The code being edited, or `null` to create a new one. */
  discount: DiscountCode | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Create / edit form. The parent mounts it with a `key` per code, so the
 * form state starts fresh for each one.
 */
function DiscountFormSheet({
  discount,
  open,
  onOpenChange,
}: DiscountFormSheetProps) {
  const [values, setValues] = useState(() =>
    toFormValues(discount ?? undefined),
  );
  const [errors, setErrors] = useState<DiscountFormErrors>({});
  const editing = discount !== null;

  function set<K extends keyof DiscountFormValues>(
    key: K,
    value: DiscountFormValues[K],
  ) {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const focusFirstError = () =>
      requestAnimationFrame(() =>
        form.querySelector<HTMLElement>("[aria-invalid=true]")?.focus(),
      );

    const result = validateDiscountForm(values);
    if (!result.success) {
      setErrors(result.errors);
      focusFirstError();
      return;
    }

    const saved = saveDiscountCode(result.data, discount?.id);
    if (!saved.ok) {
      setErrors({ code: saved.error });
      focusFirstError();
      return;
    }
    toast.add({
      type: "success",
      title: editing ? "Discount updated" : "Discount created",
      description: saved.code.code,
    });
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 sm:max-w-lg">
        <SheetHeader className="border-b">
          <SheetTitle>{editing ? "Edit discount" : "Add discount"}</SheetTitle>
          <SheetDescription>
            Codes work at checkout straight away (saved in this browser).
          </SheetDescription>
        </SheetHeader>
        <form
          noValidate
          onSubmit={onSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <ScrollArea className="min-h-0 flex-1">
            <FieldGroup className="gap-5 p-4">
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  name="code"
                  idPrefix="discount"
                  label="Code"
                  autoComplete="off"
                  value={values.code}
                  onChange={(event) =>
                    set("code", event.target.value.toUpperCase())
                  }
                  error={errors.code}
                  description="What shoppers type at checkout."
                />
                <Field>
                  <FieldLabel htmlFor="discount-kind">Type</FieldLabel>
                  <Select
                    items={kindItems}
                    value={values.kind}
                    onValueChange={(value) => {
                      if (value) set("kind", value as DiscountKind);
                    }}
                  >
                    <SelectTrigger id="discount-kind" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {kindItems.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <TextField
                name="description"
                idPrefix="discount"
                label="Description"
                value={values.description}
                placeholder="10% off your order"
                onChange={(event) => set("description", event.target.value)}
                error={errors.description}
                description="Shown next to the code once it’s applied."
              />
              <div className="grid gap-5 sm:grid-cols-2">
                {values.kind !== "free-shipping" && (
                  <AddonField
                    name="value"
                    label={
                      values.kind === "percent" ? "Percent off" : "Amount off"
                    }
                    prefix={values.kind === "fixed" ? "$" : undefined}
                    suffix={values.kind === "percent" ? "%" : undefined}
                    value={values.value}
                    error={errors.value}
                    onChange={(value) => set("value", value)}
                  />
                )}
                <AddonField
                  name="minSubtotal"
                  label="Minimum subtotal"
                  prefix="$"
                  value={values.minSubtotal}
                  error={errors.minSubtotal}
                  description="Optional."
                  onChange={(value) => set("minSubtotal", value)}
                />
              </div>

              <FieldSeparator>Limits</FieldSeparator>

              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  name="startsAt"
                  idPrefix="discount"
                  label="Starts"
                  type="date"
                  value={values.startsAt}
                  onChange={(event) => set("startsAt", event.target.value)}
                  error={errors.startsAt}
                  description="Optional. Works from this day."
                />
                <TextField
                  name="endsAt"
                  idPrefix="discount"
                  label="Ends"
                  type="date"
                  value={values.endsAt}
                  onChange={(event) => set("endsAt", event.target.value)}
                  error={errors.endsAt}
                  description="Optional. Works through this day."
                />
              </div>
              <TextField
                name="usageLimit"
                idPrefix="discount"
                label="Usage limit"
                inputMode="numeric"
                value={values.usageLimit}
                onChange={(event) => set("usageLimit", event.target.value)}
                error={errors.usageLimit}
                description="Optional. Total orders that can use it; cancelled orders don’t count."
              />
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="discount-active">Active</FieldLabel>
                  <FieldDescription>
                    Turn off to pause the code without deleting it.
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id="discount-active"
                  aria-label="Active"
                  checked={values.isActive}
                  onCheckedChange={(checked) => set("isActive", checked)}
                />
              </Field>
            </FieldGroup>
          </ScrollArea>
          <SheetFooter className="flex-row justify-end border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editing ? "Save changes" : "Create discount"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export { DiscountFormSheet };
