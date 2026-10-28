import { z } from "zod";

const reviewSchema = z.object({
  rating: z
    .number({ error: "Pick a rating" })
    .int()
    .min(1, { error: "Pick a rating" })
    .max(5),
  title: z
    .string()
    .trim()
    .min(3, { error: "Give your review a short title" })
    .max(80, { error: "Keep the title under 80 characters" }),
  body: z
    .string()
    .trim()
    .min(20, { error: "Write at least 20 characters" })
    .max(2000, { error: "Keep it under 2,000 characters" }),
});

type ReviewErrors = Partial<Record<keyof z.input<typeof reviewSchema>, string>>;

function validateReview(
  input: Record<string, unknown>,
):
  | { success: true; data: z.output<typeof reviewSchema> }
  | { success: false; errors: ReviewErrors } {
  const result = reviewSchema.safeParse(input);
  if (result.success) return { success: true, data: result.data };

  const errors: ReviewErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof ReviewErrors | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return { success: false, errors };
}

/** "Priya Shah" → "Priya S.", like the catalogue's generated reviews. */
function reviewAuthorName(fullName: string) {
  const [first = "", ...rest] = fullName.trim().split(/\s+/);
  const initial = rest.at(-1)?.charAt(0).toUpperCase();
  return initial ? `${first} ${initial}.` : first;
}

export { reviewAuthorName, reviewSchema, validateReview, type ReviewErrors };
