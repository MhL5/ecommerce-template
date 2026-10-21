import { urlSchema } from "@/schemas/urlSchema";
import { createEnv } from "@t3-oss/env-nextjs";

const clientEnv = createEnv({
  client: {
    NEXT_PUBLIC_FRONTEND_DOMAIN: urlSchema,
    NEXT_PUBLIC_CONTACT_US_SUPPORT_LINK: urlSchema,
  },
  runtimeEnv: {
    NEXT_PUBLIC_FRONTEND_DOMAIN: process.env.NEXT_PUBLIC_FRONTEND_DOMAIN,
    NEXT_PUBLIC_CONTACT_US_SUPPORT_LINK:
      process.env.NEXT_PUBLIC_CONTACT_US_SUPPORT_LINK,
  },
});

export { clientEnv };
