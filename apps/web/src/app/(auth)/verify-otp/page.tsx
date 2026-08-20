"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthCard, VerifyOtpForm } from "@/features/auth";
import { LoadingSpinner } from "@/shared/components";
import { ROUTES } from "@/constants/routes";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || undefined;
  const email = searchParams.get("email") || undefined;

  return (
    <AuthCard
      title="Two-Factor Verification"
      description="Enter the 6-digit security code sent to your registered account to continue"
      backHref={ROUTES.AUTH.LOGIN}
      backLabel="Back to Sign In"
      footer={
        <div className="text-center text-xs sm:text-sm">
          <span className="text-muted-foreground">Having trouble? </span>
          <Link
            href={ROUTES.AUTH.LOGIN}
            className="font-semibold text-primary hover:underline ml-1"
          >
            Try another method
          </Link>
        </div>
      }
    >
      <VerifyOtpForm
        userId={userId}
        email={email}
        onSuccess={() => router.push(ROUTES.DASHBOARD)}
      />
    </AuthCard>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size={28} />
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
