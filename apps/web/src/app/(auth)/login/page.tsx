"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthCard, LoginForm } from "@/features/auth";
import { ROUTES } from "@/constants/routes";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSuccess = () => {
    const redirectParam = searchParams.get("redirect");
    const target =
      redirectParam &&
      redirectParam.startsWith("/") &&
      !redirectParam.startsWith("//")
        ? redirectParam
        : ROUTES.DASHBOARD;

    window.location.replace(target);
  };

  return (
    <AuthCard
      asideMode="login"
      title="Welcome Back"
      description="Sign in to your account to continue"
    >
      <LoginForm
        onSuccess={handleSuccess}
        onRequiresOtp={(userId) => {
          const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
          router.push(`${ROUTES.AUTH.VERIFY_OTP}${query}`);
        }}
        onRequiresFirstLoginSetup={(userId) => {
          const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
          router.push(`${ROUTES.AUTH.FIRST_LOGIN_SETUP}${query}`);
        }}
      />
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
