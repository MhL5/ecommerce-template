"use client";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TextField } from "@/components/ui/text-field";
import { COUNTRIES } from "@/features/checkout/utils/countries";
import type { CheckoutErrors } from "@/features/checkout/utils/schema";

type Defaults = Partial<
  Record<
    | "email"
    | "phone"
    | "firstName"
    | "lastName"
    | "address1"
    | "address2"
    | "city"
    | "region"
    | "postalCode"
    | "country",
    string
  >
>;

function ContactFields({
  errors,
  defaults,
}: {
  errors: CheckoutErrors;
  defaults: Defaults;
}) {
  return (
    <FieldGroup className="grid gap-5 sm:grid-cols-2">
      <TextField
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        defaultValue={defaults.email}
        error={errors.email}
        description="We’ll send your receipt here."
      />
      <TextField
        name="phone"
        label="Phone (optional)"
        type="tel"
        autoComplete="tel"
        defaultValue={defaults.phone}
        error={errors.phone}
        description="Only used for delivery questions."
      />
    </FieldGroup>
  );
}

function AddressFields({
  errors,
  defaults,
}: {
  errors: CheckoutErrors;
  defaults: Defaults;
}) {
  return (
    <FieldGroup className="grid gap-5 sm:grid-cols-2">
      <TextField
        name="firstName"
        label="First name"
        autoComplete="given-name"
        defaultValue={defaults.firstName}
        error={errors.firstName}
      />
      <TextField
        name="lastName"
        label="Last name"
        autoComplete="family-name"
        defaultValue={defaults.lastName}
        error={errors.lastName}
      />
      <TextField
        name="address1"
        label="Address"
        autoComplete="address-line1"
        placeholder="Street and number"
        defaultValue={defaults.address1}
        error={errors.address1}
        className="sm:col-span-2"
      />
      <TextField
        name="address2"
        label="Apartment, suite, etc. (optional)"
        autoComplete="address-line2"
        defaultValue={defaults.address2}
        error={errors.address2}
        className="sm:col-span-2"
      />
      <TextField
        name="city"
        label="City"
        autoComplete="address-level2"
        defaultValue={defaults.city}
        error={errors.city}
      />
      <TextField
        name="region"
        label="State / region"
        autoComplete="address-level1"
        defaultValue={defaults.region}
        error={errors.region}
      />
      <TextField
        name="postalCode"
        label="Postal code"
        autoComplete="postal-code"
        defaultValue={defaults.postalCode}
        error={errors.postalCode}
      />
      <Field data-invalid={!!errors.country}>
        <FieldLabel htmlFor="field-country">Country</FieldLabel>
        <Select
          name="country"
          items={COUNTRIES}
          defaultValue={defaults.country ?? "US"}
        >
          <SelectTrigger
            id="field-country"
            className="w-full"
            aria-invalid={!!errors.country}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {errors.country && <FieldError>{errors.country}</FieldError>}
      </Field>
    </FieldGroup>
  );
}

export { AddressFields, ContactFields, type Defaults as CheckoutDefaults };
