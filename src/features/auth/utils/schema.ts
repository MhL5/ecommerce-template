import { z } from "zod";

const email = z
  .string()
  .trim()
  .min(1, { error: "Email is required" })
  .pipe(z.email({ error: "Enter a valid email address" }));

const newPassword = z
  .string()
  .min(8, { error: "Use at least 8 characters" })
  .regex(/[A-Za-z]/, { error: "Include at least one letter" })
  .regex(/\d/, { error: "Include at least one number" });

const loginSchema = z.object({
  email,
  password: z.string().min(1, { error: "Password is required" }),
});

const registerSchema = z
  .object({
    name: z.string().trim().min(2, { error: "Enter your full name" }),
    email,
    password: newPassword,
    confirmPassword: z.string().min(1, { error: "Confirm your password" }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    error: "Passwords don’t match",
  });

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { error: "Enter your current password" }),
    password: newPassword,
    confirmPassword: z.string().min(1, { error: "Confirm your new password" }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    error: "Passwords don’t match",
  })
  .refine((values) => values.password !== values.currentPassword, {
    path: ["password"],
    error: "Choose a password you haven’t used here",
  });

type FieldErrors<T> = Partial<Record<keyof T, string>>;

/** First message per field from a zod parse, or `null` when valid. */
function fieldErrors<T extends Record<string, unknown>>(
  schema: z.ZodType<T>,
  values: Record<string, unknown>,
): FieldErrors<T> | null {
  const result = schema.safeParse(values);
  if (result.success) return null;
  const errors: FieldErrors<T> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof T | undefined;
    if (key !== undefined && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

export {
  changePasswordSchema,
  fieldErrors,
  loginSchema,
  registerSchema,
  type FieldErrors,
};
