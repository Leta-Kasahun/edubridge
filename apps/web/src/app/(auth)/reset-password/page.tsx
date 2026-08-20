"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, User, CheckCircle2, ArrowRight } from "lucide-react";
import { AuthCard, AuthIdentifierToggle, AuthIdentifierMode } from "@/features/auth";
import { FormField, SubmitButton, ErrorAlert } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";
import { authService } from "@/features/auth/services";
import { resetPasswordRequestValidationSchema, ResetPasswordRequestFormData } from "@/features/auth/validations";
import { ROUTES } from "@/constants/routes";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<AuthIdentifierMode>("email");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordRequestFormData>({
    resolver: zodResolver(resetPasswordRequestValidationSchema),
    defaultValues: {
      email: "",
    },
  });

  const identifierValue = watch("email");

  const onSubmit = async (values: ResetPasswordRequestFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const rawValue = values.email.trim();
      if (authMode === "username") {
        router.push(`${ROUTES.AUTH.FIRST_LOGIN_SETUP}?email=${encodeURIComponent(rawValue)}`);
        return;
      }
      await authService.resendOtp({
        identifier: rawValue,
        email: rawValue.includes("@") ? rawValue : undefined,
        purpose: "PASSWORD_RESET",
      });
      setIsSubmitted(true);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to verify account. Please check your credentials and try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToOtp = () => {
    const query = identifierValue ? `?email=${encodeURIComponent(identifierValue.trim())}&purpose=PASSWORD_RESET` : "";
    router.push(`${ROUTES.AUTH.VERIFY_OTP}${query}`);
  };

  return (
    <AuthCard
      title="Reset Password"
      description={
        isSubmitted
          ? "Check your inbox for the one-time verification code (OTP)"
          : authMode === "email"
          ? "Enter your registered email address to receive an OTP verification code"
          : "Enter your registered username to directly update your password"
      }
      backHref={ROUTES.AUTH.LOGIN}
      backLabel="Back to Sign In"
      footer={
        <div className="text-center text-xs sm:text-sm">
          <span className="text-muted-foreground">Remembered your password? </span>
          <Link
            href={ROUTES.AUTH.LOGIN}
            className="font-semibold text-primary hover:underline ml-1"
          >
            Sign In
          </Link>
        </div>
      }
    >
      {isSubmitted ? (
        <div className="text-center space-y-5 py-4">
          <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-primary border border-primary/20 mx-auto flex items-center justify-center">
            <CheckCircle2 size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">OTP Sent</h3>
            <p className="text-sm text-muted-foreground">
              We sent a verification code to the registered account associated with{" "}
              <strong className="text-foreground font-medium">{identifierValue}</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={handleProceedToOtp}
            className="inline-flex items-center justify-center w-full h-11 sm:h-12 rounded-xl text-sm sm:text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm cursor-pointer"
          >
            Enter Verification Code
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 w-full">
          {error && <ErrorAlert message={error} />}

          <AuthIdentifierToggle mode={authMode} onChange={setAuthMode} />

          <FormField
            id="email"
            label={authMode === "email" ? "Email Address" : "Username"}
            type="text"
            placeholder={authMode === "email" ? "Enter your email address" : "Enter your username"}
            autoComplete={authMode === "email" ? "email" : "username"}
            leftIcon={authMode === "email" ? <Mail size={18} /> : <User size={18} />}
            error={errors.email?.message}
            {...register("email")}
          />

          <SubmitButton
            isLoading={isLoading}
            loadingText={authMode === "email" ? "Sending OTP..." : "Submitting..."}
            icon={<ArrowRight size={18} />}
            iconPosition="right"
          >
            {authMode === "email" ? "Send OTP" : "Submit"}
          </SubmitButton>
        </form>
      )}
    </AuthCard>
  );
}
