"use client";

import { useRouter } from "next/navigation";
import { AuthCard, LoginForm } from "@/features/auth";
import { ROUTES } from "@/constants/routes";

export default function LoginPage() {
  const router = useRouter();

  return (
    <AuthCard
      title="Welcome Back"
      description="Sign in to your account to continue"
      backHref={ROUTES.HOME}
      backLabel="Back to Home"
    >
      <LoginForm
        onSuccess={(data) => {
          if (data?.user?.roles?.includes("TEACHER")) {
            router.push(ROUTES.ONBOARDING.TEACHER);
          } else {
            router.push(ROUTES.DASHBOARD);
          }
        }}
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
