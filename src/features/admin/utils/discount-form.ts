import type { DiscountCodeInput } from "@/features/checkout/api/discount-store";
import type { DiscountCode, DiscountKind } from "@/features/checkout/types";
import { z } from "zod";

/** Form fields as typed (strings); converted to cents/dates on success. */
type DiscountFormValues = {
  code: string;
  description: string;
  kind: DiscountKind;
  value: string;
  minSubtotal: string;
  startsAt: string;
  endsAt: string;
  usageLimit: string;
  isActive: boolean;
};

const optionalMoney = z
  .string()
  .trim()
  .refine((value) => value === "" || /^\d+(\.\d{1,2})?$/.test(value), {
    error: "Use a number like 50 or 49.99, or leave empty",
  })
  .transform((value) =>
    value === "" ? null : Math.round(Number(value) * 100),
  );

/** `YYYY-MM-DD` from a date input, or empty. */
const optionalDate = z
  .string()
  .trim()
  .refine((value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value), {
    error: "Pick a date",
  })
  .transform((value) => (value === "" ? null : value));

const discountFormSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9_-]{3,20}$/, {
        error: "3–20 letters, numbers, dashes or underscores",
      }),
    description: z
      .string()
      .trim()
      .min(3, { error: "Say what the code gives, e.g. “10% off”" }),
    kind: z.enum(["percent", "fixed", "free-shipping"]),
    value: z.string().trim(),
    minSubtotal: optionalMoney,
    startsAt: optionalDate,
    endsAt: optionalDate,
    usageLimit: z
      .string()
      .trim()
      .refine((value) => value === "" || /^[1-9]\d*$/.test(value), {
        error: "A whole number above 0, or leave empty",
      })
      .transform((value) => (value === "" ? null : Number(value))),
    isActive: z.boolean(),
  })
  // `value` and the date range are checked by `crossFieldErrors`.
  .transform((values) => ({
    ...values,
    value:
      values.kind === "percent"
        ? Number(values.value)
        : values.kind === "fixed"
          ? Math.round(Number(values.value) * 100)
          : 0,
  }));

type DiscountFormErrors = Partial<Record<keyof DiscountFormValues, string>>;

/**
 * Checks that depend on other fields. Run separately so they show up
 * together with the per-field errors instead of after them.
 */
function crossFieldErrors(values: DiscountFormValues): DiscountFormErrors {
  const errors: DiscountFormErrors = {};
  const raw = values.value.trim();
  if (values.kind === "percent") {
    const percent = Number(raw);
    if (!/^\d+$/.test(raw) || percent < 1 || percent > 100)
      errors.value = "A whole percentage from 1 to 100";
  } else if (values.kind === "fixed") {
    if (!/^\d+(\.\d{1,2})?$/.test(raw) || Number(raw) <= 0)
      errors.value = "Use an amount like 20 or 19.99";
  }
  if (values.startsAt && values.endsAt && values.endsAt < values.startsAt)
    errors.endsAt = "Must be on or after the start date";
  return errors;
}

function toFormValues(code?: DiscountCode): DiscountFormValues {
  if (!code) {
    return {
      code: "",
      description: "",
      kind: "percent",
      value: "",
      minSubtotal: "",
      startsAt: "",
      endsAt: "",
      usageLimit: "",
      isActive: true,
    };
  }
  return {
    code: code.code,
    description: code.description,
    kind: code.kind,
    value:
      code.kind === "fixed"
        ? (code.value / 100).toString()
        : code.kind === "percent"
          ? String(code.value)
          : "",
    minSubtotal: code.minSubtotal ? (code.minSubtotal / 100).toString() : "",
    startsAt: code.startsAt?.slice(0, 10) ?? "",
    endsAt: code.endsAt?.slice(0, 10) ?? "",
    usageLimit: code.usageLimit ? String(code.usageLimit) : "",
    isActive: code.isActive,
  };
}

function validateDiscountForm(
  values: DiscountFormValues,
):
  | { success: true; data: DiscountCodeInput }
  | { success: false; errors: DiscountFormErrors } {
  const result = discountFormSchema.safeParse(values);
  const errors = crossFieldErrors(values);
  if (result.success && Object.keys(errors).length === 0) {
    const { minSubtotal, ...data } = result.data;
    return {
      success: true,
      data: { ...data, ...(minSubtotal ? { minSubtotal } : {}) },
    };
  }

  for (const issue of result.error?.issues ?? []) {
    const field = issue.path[0] as keyof DiscountFormValues | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return { success: false, errors };
}

export {
  toFormValues,
  validateDiscountForm,
  type DiscountFormErrors,
  type DiscountFormValues,
};
