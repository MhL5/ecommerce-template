import { clientEnv } from "@/env/clientEnv";
import { SITE_NAME, SITE_TAGLINE } from "@/features/layout/config";
import { cn } from "@/lib/utils";
import Providers from "@/providers";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(clientEnv.NEXT_PUBLIC_FRONTEND_DOMAIN),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "A demo ecommerce storefront with mock products, cart, checkout and accounts.",
};

/**
 * Shell shared by the shop (`(shop)/layout.tsx`: header + footer) and the
 * admin panel (`admin/layout.tsx`: sidebar).
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      data-scroll-behavior="smooth"
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", "font-sans", inter.variable)}
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
