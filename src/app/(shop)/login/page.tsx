import { AuthCardSkeleton } from "@/features/auth/components/AuthCardSkeleton";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { PageContainer } from "@/features/layout/components/PageContainer";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <PageContainer className="flex flex-1 items-start justify-center py-12 sm:py-16">
      <Suspense fallback={<AuthCardSkeleton />}>
        <LoginForm />
      </Suspense>
    </PageContainer>
  );
}
