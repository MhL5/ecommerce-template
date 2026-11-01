import z from "zod";

export const urlSchema = z.url().refine((url) => !url.endsWith("/"), {
  error: "URL must not end with a trailing slash",
});
