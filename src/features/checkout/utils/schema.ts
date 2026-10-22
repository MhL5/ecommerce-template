import { z } from "zod";

/** Luhn checksum, so obviously mistyped card numbers are caught. */
function passesLuhn(digits: string) {
  let sum = 0;
  let double = false;
  for (let index = digits.length - 1; index >= 0; index--) {
    let digit = Number(digits[index]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

/** `MM/YY` that is this month or later. */
function isFutureExpiry(value: string, now = new Date()) {
  const match = /^(\d{2})\s*\/\s*(\d{2})$/.exec(value);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);
  return endOfMonth >= now;
}

const required = (label: string) =>
  z
    .string()
    .trim()
    .min(1, { error: `${label} is required` });

const checkoutSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { error: "Email is required" })
    .pipe(z.email({ error: "Enter a valid email address" })),
  phone: z
    .string()
    .trim()
    .refine((value) => value === "" || /^[+\d][\d\s().-]{6,}$/.test(value), {
      error: "Enter a valid phone number",
    }),

  firstName: required("First name"),
  lastName: required("Last name"),
  address1: required("Address"),
  address2: z.string().trim(),
  city: required("City"),
  region: required("State / region"),
  postalCode: z
    .string()
    .trim()
    .min(1, { error: "Postal code is required" })
    .regex(/^[A-Za-z0-9][A-Za-z0-9\s-]{2,9}$/, {
      error: "Enter a valid postal code",
    }),
  country: required("Country"),

  shippingMethod: z.enum(["standard", "express"], {
    error: "Choose a shipping method",
  }),

  cardName: required("Name on card"),
  cardNumber: z
    .string()
    .transform((value) => value.replace(/[\s-]/g, ""))
    .pipe(
      z
        .string()
        .regex(/^\d{13,19}$/, { error: "Enter a valid card number" })
        .refine(passesLuhn, { error: "That card number isn’t valid" }),
    ),
  cardExpiry: z
    .string()
    .trim()
    .refine((value) => isFutureExpiry(value), {
      error: "Use a future date as MM/YY",
    }),
  cardCvc: z
    .string()
    .trim()
    .regex(/^\d{3,4}$/, { error: "3 or 4 digits" }),
});

type CheckoutInput = z.input<typeof checkoutSchema>;
type CheckoutValues = z.output<typeof checkoutSchema>;
type CheckoutField = keyof CheckoutInput;
type CheckoutErrors = Partial<Record<CheckoutField, string>>;

/** Validates raw form values and returns either data or per-field messages. */
function validateCheckout(
  input: Record<string, unknown>,
):
  | { success: true; data: CheckoutValues }
  | { success: false; errors: CheckoutErrors } {
  const result = checkoutSchema.safeParse(input);
  if (result.success) return { success: true, data: result.data };

  const errors: CheckoutErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as CheckoutField | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return { success: false, errors };
}

/** Published test card that passes Luhn. */
const TEST_CARD = {
  cardName: "Test Customer",
  cardNumber: "4242 4242 4242 4242",
  cardExpiry: "12/30",
  cardCvc: "123",
} as const;

export {
  checkoutSchema,
  isFutureExpiry,
  passesLuhn,
  TEST_CARD,
  validateCheckout,
  type CheckoutErrors,
  type CheckoutField,
  type CheckoutInput,
  type CheckoutValues,
};
