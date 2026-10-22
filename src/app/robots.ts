import { clientEnv } from "@/env/clientEnv";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/account", "/checkout", "/cart", "/wishlist"],
    },
    sitemap: `${clientEnv.NEXT_PUBLIC_FRONTEND_DOMAIN}/sitemap.xml`,
  };
}
