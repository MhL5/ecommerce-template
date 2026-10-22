import { AccountShell } from "@/features/account/components/AccountShell";
import { PageContainer } from "@/features/layout/components/PageContainer";

export default function AccountLayout({ children }: LayoutProps<"/account">) {
  return (
    <PageContainer className="py-8 sm:py-10">
      <AccountShell>{children}</AccountShell>
    </PageContainer>
  );
}
