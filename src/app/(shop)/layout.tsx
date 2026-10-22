import { ShopShell } from "@/features/layout/components/ShopShell";

export default function ShopLayout({ children }: LayoutProps<"/">) {
  return <ShopShell>{children}</ShopShell>;
}
