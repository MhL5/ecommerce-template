"use client";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatAddressLine } from "@/features/addresses/components/AddressLines";
import type { SavedAddress } from "@/features/addresses/types";

/** Value used for "type a new address". */
const NEW_ADDRESS = "new";

/**
 * Choice cards for a signed-in shopper's saved addresses. Has no `name`, so
 * it isn't part of the checkout form data; picking one refills the fields.
 */
function SavedAddressPicker({
  addresses,
  value,
  onChange,
}: {
  addresses: SavedAddress[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(next) => onChange(next as string)}
      aria-label="Saved addresses"
      className="sm:grid-cols-2"
    >
      {addresses.map((address) => {
        const id = `saved-address-${address.id}`;
        const name = `${address.firstName} ${address.lastName}`;
        return (
          <FieldLabel key={address.id} htmlFor={id}>
            <Field orientation="horizontal">
              <RadioGroupItem
                id={id}
                value={address.id}
                aria-label={`${address.label || name}, ${formatAddressLine(address)}`}
              />
              <FieldContent className="min-w-0">
                <FieldTitle className="truncate">
                  {address.label || name}
                </FieldTitle>
                <FieldDescription className="line-clamp-2">
                  {formatAddressLine(address)}
                </FieldDescription>
              </FieldContent>
            </Field>
          </FieldLabel>
        );
      })}
      <FieldLabel htmlFor="saved-address-new">
        <Field orientation="horizontal">
          <RadioGroupItem
            id="saved-address-new"
            value={NEW_ADDRESS}
            aria-label="Use a new address"
          />
          <FieldContent>
            <FieldTitle>New address</FieldTitle>
            <FieldDescription>Type it in below.</FieldDescription>
          </FieldContent>
        </Field>
      </FieldLabel>
    </RadioGroup>
  );
}

export { NEW_ADDRESS, SavedAddressPicker };
