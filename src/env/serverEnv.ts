import { createEnv } from "@t3-oss/env-nextjs";

const serverEnv = createEnv({
  server: {},
  experimental__runtimeEnv: process.env,
});

export { serverEnv };
