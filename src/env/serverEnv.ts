import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";
/**
 * NOTE:using @ import for `urlSchema` breaks env validation
 * causes this error:Cannot find module './src/schema/urlSchema'
 */
import { urlSchema } from "../schema/urlSchema";

const serverEnv = createEnv({
  server: {
    // Database
    NEXT_DATABASE_URL: urlSchema,
    // AWS S3 object storage
    NEXT_AWS_ENDPOINT_URL_S3: urlSchema,
    NEXT_AWS_ACCESS_KEY_ID: z.string().min(1),
    NEXT_AWS_SECRET_ACCESS_KEY: z.string().min(1),
    NEXT_AWS_REGION: z.string().min(1),
  },
  experimental__runtimeEnv: process.env,
});

export { serverEnv };
