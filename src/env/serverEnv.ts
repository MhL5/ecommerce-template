import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

const serverEnv = createEnv({
  server: {
    S3_ENDPOINT: z.url(),
    S3_REGION: z.string().min(1).default("auto"),
    S3_BUCKET: z.string().min(1),
    S3_ACCESS_KEY_ID: z.string().min(1),
    S3_SECRET_ACCESS_KEY: z.string().min(1),
  },
  experimental__runtimeEnv: process.env,
});

export { serverEnv };
