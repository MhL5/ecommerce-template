import { checkoutSchema } from "@/features/checkout/utils/schema";
import { z } from "zod";

/** Same rules as the checkout address, plus an optional nickname. */
const addressSchema = checkoutSchema
  .pick({
    firstName: true,
    lastName: true,
    address1: true,
    address2: true,
    city: true,
    region: true,
    postalCode: true,
    country: true,
    phone: true,
  })
  .extend({
    label: z
      .string()
      .trim()
      .max(30, { error: "Keep the nickname under 30 characters" }),
  });

type AddressField = keyof z.input<typeof addressSchema>;
type AddressErrors = Partial<Record<AddressField, string>>;

function validateAddress(
  input: Record<string, unknown>,
):
  | { success: true; data: z.output<typeof addressSchema> }
  | { success: false; errors: AddressErrors } {
  const result = addressSchema.safeParse(input);
  if (result.success) return { success: true, data: result.data };

  const errors: AddressErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as AddressField | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return { success: false, errors };
}

export { addressSchema, validateAddress, type AddressErrors };
