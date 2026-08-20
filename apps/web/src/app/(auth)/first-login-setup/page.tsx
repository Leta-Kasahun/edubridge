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
  const userId = searchParams.get("userId") || undefined;

  return (
    <AuthCard
      title="Set Your Password"
      description="Replace your temporary credentials with a secure personal password"
      backHref={ROUTES.AUTH.LOGIN}
      backLabel="Back to Sign In"
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
        email={email}
        userId={userId}
        onSuccess={() => router.push(ROUTES.DASHBOARD)}
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
