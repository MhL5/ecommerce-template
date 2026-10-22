"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { TextField } from "@/components/ui/text-field";
import {
  type CheckoutErrors,
  TEST_CARD,
} from "@/features/checkout/utils/schema";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { flushSync } from "react-dom";

type CardValues = {
  cardName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
};

/** `4242424242424242` → `4242 4242 4242 4242` (max 19 digits). */
function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

/** `1230` → `12/30`. */
function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2
    ? `${digits.slice(0, 2)}/${digits.slice(2)}`
    : digits;
}

function PaymentFields({
  errors,
  onFilled,
}: {
  errors: CheckoutErrors;
  /** Called after "Use test card" fills the inputs, to re-run validation. */
  onFilled?: () => void;
}) {
  const [values, setValues] = useState<CardValues>({
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
  });

  function set<K extends keyof CardValues>(key: K, value: string) {
    setValues((previous) => ({ ...previous, [key]: value }));
  }

  return (
    <div className="flex flex-col gap-5">
      <Alert>
        <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} />
        <AlertTitle>Test mode — no real payments</AlertTitle>
        <AlertDescription>
          <p>
            Don’t enter a real card. Use{" "}
            <span className="font-mono">4242 4242 4242 4242</span>, any future
            expiry and any 3-digit CVC.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => {
              // Commit the new values first so re-validation reads them.
              flushSync(() => setValues({ ...TEST_CARD }));
              onFilled?.();
            }}
          >
            Use test card
          </Button>
        </AlertDescription>
      </Alert>

      <FieldGroup className="grid gap-5 sm:grid-cols-2">
        <TextField
          name="cardName"
          label="Name on card"
          autoComplete="off"
          value={values.cardName}
          onChange={(event) => set("cardName", event.target.value)}
          error={errors.cardName}
          className="sm:col-span-2"
        />
        <TextField
          name="cardNumber"
          label="Card number"
          inputMode="numeric"
          autoComplete="off"
          placeholder="4242 4242 4242 4242"
          value={values.cardNumber}
          onChange={(event) =>
            set("cardNumber", formatCardNumber(event.target.value))
          }
          error={errors.cardNumber}
          className="sm:col-span-2"
        />
        <TextField
          name="cardExpiry"
          label="Expiry (MM/YY)"
          inputMode="numeric"
          autoComplete="off"
          placeholder="MM/YY"
          value={values.cardExpiry}
          onChange={(event) =>
            set("cardExpiry", formatExpiry(event.target.value))
          }
          error={errors.cardExpiry}
        />
        <TextField
          name="cardCvc"
          label="CVC"
          inputMode="numeric"
          autoComplete="off"
          placeholder="123"
          maxLength={4}
          value={values.cardCvc}
          onChange={(event) =>
            set("cardCvc", event.target.value.replace(/\D/g, ""))
          }
          error={errors.cardCvc}
        />
      </FieldGroup>
    </div>
  );
}

export { PaymentFields };
