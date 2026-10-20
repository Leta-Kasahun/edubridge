"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthCard, VerifyOtpForm, OtpPurpose } from "@/features/auth";
import { LoadingSpinner } from "@/shared/components";
import { ROUTES } from "@/constants/routes";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || undefined;
  const email = searchParams.get("email") || undefined;
  const rawPurpose = searchParams.get("purpose");
  const purpose: OtpPurpose | undefined =
    rawPurpose === "LOGIN_2FA" ||
    rawPurpose === "EMAIL_VERIFICATION" ||
    rawPurpose === "EMAIL_CHANGE" ||
    rawPurpose === "PASSWORD_RESET" ||
    rawPurpose === "INVITATION_ACCEPT"
      ? rawPurpose
      : undefined;

  return (
    <AuthCard
      asideMode="general"
      title="Two-Factor Verification"
      description="Enter the 6-digit security code sent to your registered account to continue"
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
        purpose={purpose}
        onSuccess={() => window.location.replace(ROUTES.DASHBOARD)}
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
