import { AuthCardSkeleton } from "@/features/auth/components/AuthCardSkeleton";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { PageContainer } from "@/features/layout/components/PageContainer";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Create an account" };

export default function RegisterPage() {
  return (
    <PageContainer className="flex flex-1 items-start justify-center py-12 sm:py-16">
      <Suspense fallback={<AuthCardSkeleton />}>
        <RegisterForm />
      </Suspense>
    </PageContainer>
  );
}
