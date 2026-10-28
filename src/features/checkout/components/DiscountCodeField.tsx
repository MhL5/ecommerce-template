"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import type { Discount } from "@/features/cart/utils/totals";
import { useDiscountCodes } from "@/features/checkout/api/discount-store";
import {
  countDiscountUses,
  getDiscountStatus,
  lookupDiscount,
} from "@/features/checkout/utils/discounts";
import { useAllOrders } from "@/features/orders/hooks/use-orders";
import { Cancel01Icon, DiscountTag01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

type DiscountCodeFieldProps = {
  applied: Discount | null;
  subtotal: number;
  onApply: (discount: Discount | null) => void;
};

/**
 * Promo code entry. It lives inside the checkout form, so the input has no
 * `name` and Enter applies the code instead of submitting the order.
 */
function DiscountCodeField({
  applied,
  subtotal,
  onApply,
}: DiscountCodeFieldProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const codes = useDiscountCodes();
  const { orders } = useAllOrders();
  const uses = countDiscountUses(orders);
  // Only rendered after hydration (inside the checkout form), so reading the
  // clock here can't cause a hydration mismatch.
  const [now] = useState(() => Date.now());
  const suggestions = codes
    .filter(
      (code) =>
        !code.minSubtotal &&
        getDiscountStatus(code, uses.get(code.code) ?? 0, now) === "active",
    )
    .slice(0, 3)
    .map((code) => code.code);

  function apply() {
    const result = lookupDiscount(value, subtotal, codes, uses, now);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    setValue("");
    onApply(result.discount);
  }

  if (applied) {
    return (
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="flex min-w-0 items-center gap-2">
          <Badge variant="secondary">
            <HugeiconsIcon icon={DiscountTag01Icon} strokeWidth={2} />
            {applied.code}
          </Badge>
          <span className="truncate text-muted-foreground">
            {applied.description}
          </span>
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Remove code ${applied.code}`}
          onClick={() => onApply(null)}
        >
          <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
        </Button>
      </div>
    );
  }

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor="discount-code">Discount code</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id="discount-code"
          value={value}
          placeholder="e.g. WELCOME10"
          autoComplete="off"
          aria-invalid={!!error}
          onChange={(event) => {
            setValue(event.target.value);
            setError(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              apply();
            }
          }}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton variant="secondary" onClick={apply}>
            Apply
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {error ? (
        <FieldError>{error}</FieldError>
      ) : (
        suggestions.length > 0 && (
          <FieldDescription>Try {suggestions.join(" or ")}.</FieldDescription>
        )
      )}
    </Field>
  );
}

export { DiscountCodeField };
