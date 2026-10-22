import type { NewProductInput } from "@/features/products/api/catalog-store";
import type { CategoryId, Product } from "@/features/products/types";
import { z } from "zod";

/** Form fields as typed (strings); converted to cents/arrays on success. */
type ProductFormValues = {
  name: string;
  brand: string;
  categoryId: CategoryId;
  price: string;
  compareAtPrice: string;
  stock: string;
  description: string;
  highlights: string;
  tags: string;
  featured: boolean;
};

const money = (label: string) =>
  z
    .string()
    .trim()
    .min(1, { error: `${label} is required` })
    .refine((value) => /^\d+(\.\d{1,2})?$/.test(value), {
      error: "Use a number like 49 or 49.99",
    })
    .transform((value) => Math.round(Number(value) * 100))
    .refine((cents) => cents > 0, { error: `${label} must be above $0` });

const lines = (value: string, separator: RegExp) =>
  value
    .split(separator)
    .map((entry) => entry.trim())
    .filter(Boolean);

const productFormSchema = z
  .object({
    name: z.string().trim().min(3, { error: "Use at least 3 characters" }),
    brand: z.string().trim().min(2, { error: "Brand is required" }),
    categoryId: z.enum(
      [
        "electronics",
        "clothing",
        "home-kitchen",
        "sports-outdoors",
        "beauty",
        "accessories",
      ],
      { error: "Choose a category" },
    ),
    price: money("Price"),
    compareAtPrice: z
      .string()
      .trim()
      .refine((value) => value === "" || /^\d+(\.\d{1,2})?$/.test(value), {
        error: "Use a number like 59.99, or leave empty",
      })
      .transform((value) =>
        value === "" ? null : Math.round(Number(value) * 100),
      ),
    stock: z
      .string()
      .trim()
      .regex(/^\d+$/, { error: "Whole number, 0 or more" })
      .transform(Number),
    description: z
      .string()
      .trim()
      .min(20, { error: "Write at least 20 characters" }),
    highlights: z.string().transform((value) => lines(value, /\n/)),
    tags: z
      .string()
      .transform((value) => lines(value, /,/).map((tag) => tag.toLowerCase())),
    featured: z.boolean(),
  })
  .refine(
    (values) =>
      values.compareAtPrice === null || values.compareAtPrice > values.price,
    {
      path: ["compareAtPrice"],
      error: "Must be higher than the price (it's the 'was' price)",
    },
  );

type ProductFormOutput = z.output<typeof productFormSchema>;
type ProductFormErrors = Partial<Record<keyof ProductFormValues, string>>;

function validateProductForm(
  values: ProductFormValues,
):
  | { success: true; data: ProductFormOutput }
  | { success: false; errors: ProductFormErrors } {
  const result = productFormSchema.safeParse(values);
  if (result.success) return { success: true, data: result.data };
  const errors: ProductFormErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof ProductFormValues | undefined;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return { success: false, errors };
}

const centsToField = (cents: number | undefined) =>
  cents === undefined ? "" : (cents / 100).toFixed(2).replace(/\.00$/, "");

function toFormValues(product?: Product): ProductFormValues {
  return {
    name: product?.name ?? "",
    brand: product?.brand ?? "",
    categoryId: product?.categoryId ?? "electronics",
    price: centsToField(product?.price),
    compareAtPrice: centsToField(product?.compareAtPrice),
    stock: product ? String(product.stock) : "0",
    description: product?.description ?? "",
    highlights: product?.highlights.join("\n") ?? "",
    tags: product?.tags.join(", ") ?? "",
    featured: product?.featured ?? false,
  };
}

/** Shape for `createProduct` (new) — `compareAtPrice` omitted when empty. */
function toNewProduct(data: ProductFormOutput): NewProductInput {
  const { compareAtPrice, ...rest } = data;
  return compareAtPrice === null ? rest : { ...rest, compareAtPrice };
}

export {
  toFormValues,
  toNewProduct,
  validateProductForm,
  type ProductFormErrors,
  type ProductFormOutput,
  type ProductFormValues,
};
