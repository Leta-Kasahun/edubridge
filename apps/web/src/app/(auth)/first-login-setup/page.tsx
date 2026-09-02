"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthCard, FirstLoginSetupForm } from "@/features/auth";
import { LoadingSpinner } from "@/shared/components";
import { ROUTES } from "@/constants/routes";

function FirstLoginSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const username = searchParams.get("username") || "";
  const modeParam = searchParams.get("mode")?.toUpperCase();
  const initialMode =
    modeParam === "USERNAME" || modeParam === "EMAIL"
      ? modeParam
      : username
        ? "USERNAME"
        : undefined;
  const userId = searchParams.get("userId") || undefined;

  return (
    <AuthCard
      title="First-Time Account Setup"
      description="Configure your personal password to activate and access your school portal"
      footer={
        <div className="text-center text-xs sm:text-sm">
          <span className="text-muted-foreground">Already have your password configured? </span>
          <Link
            href={ROUTES.AUTH.LOGIN}
            className="font-semibold text-primary hover:underline ml-1"
          >
            Sign In
          </Link>
        </div>
      }
    >
      <FirstLoginSetupForm
        initialEmail={email}
        initialUsername={username}
        initialMode={initialMode}
        userId={userId}
        onSuccess={(data) => {
          if (data?.user?.roles?.includes("TEACHER")) {
            router.push(ROUTES.ONBOARDING.TEACHER);
          } else if (data?.user?.roles?.includes("STUDENT")) {
            router.push(ROUTES.ONBOARDING.STUDENT);
          } else {
            router.push(ROUTES.AUTH.LOGIN);
          }
        }}
      />
    </AuthCard>
  );
}

export default function FirstLoginSetupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size={28} />
        </div>
      }
    >
      <FirstLoginSetupContent />
    </Suspense>
  );
}
