"use client";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  SHIPPING_METHODS,
  type ShippingMethodId,
  getShippingCost,
} from "@/features/cart/utils/totals";
import { formatPrice } from "@/lib/format";

function ShippingMethodField({
  value,
  onChange,
  subtotal,
}: {
  value: ShippingMethodId;
  onChange: (value: ShippingMethodId) => void;
  subtotal: number;
}) {
  return (
    <RadioGroup
      name="shippingMethod"
      value={value}
      onValueChange={(next) => onChange(next as ShippingMethodId)}
      aria-label="Shipping method"
    >
      {SHIPPING_METHODS.map((method) => {
        const id = `shipping-${method.id}`;
        const cost = getShippingCost(subtotal, method.id);
        return (
          <FieldLabel key={method.id} htmlFor={id}>
            <Field orientation="horizontal">
              <RadioGroupItem
                id={id}
                value={method.id}
                aria-label={`${method.label} shipping, ${method.description}`}
              />
              <FieldContent>
                <FieldTitle>{method.label}</FieldTitle>
                <FieldDescription>{method.description}</FieldDescription>
              </FieldContent>
              <span className="text-sm font-medium tabular-nums">
                {cost === 0 ? "Free" : formatPrice(cost)}
              </span>
            </Field>
          </FieldLabel>
        );
      })}
    </RadioGroup>
  );
}

export { ShippingMethodField };
