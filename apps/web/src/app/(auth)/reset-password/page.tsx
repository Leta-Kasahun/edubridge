"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, CheckCircle2, ArrowRight } from "lucide-react";
import { AuthCard } from "@/features/auth";
import { FormField, SubmitButton, ErrorAlert } from "@/shared/components";
import { resetPasswordRequestValidationSchema, ResetPasswordRequestFormData } from "@/features/auth/validations";
import { ROUTES } from "@/constants/routes";

export default function ResetPasswordPage() {
  const router = useRouter();
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

  const onSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      setIsSubmitted(true);
    } catch {
      setError("Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToOtp = () => {
    const query = identifierValue ? `?email=${encodeURIComponent(identifierValue)}` : "";
    router.push(`${ROUTES.AUTH.VERIFY_OTP}${query}`);
  };

  return (
    <AuthCard
      title="Reset Password"
      description={
        isSubmitted
          ? "Check your inbox for the one-time verification code (OTP)"
          : "Enter your registered email or username to receive a verification OTP code"
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
              We sent a verification code to the registered email associated with{" "}
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

          <FormField
            id="email"
            label="Email or Username"
            type="text"
            placeholder="Enter your email or username"
            autoComplete="username"
            leftIcon={<Mail size={18} />}
            error={errors.email?.message}
            {...register("email")}
          />

          <SubmitButton
            isLoading={isLoading}
            loadingText="Sending OTP..."
            icon={<ArrowRight size={18} />}
            iconPosition="right"
          >
            Send OTP
          </SubmitButton>
        </form>
      )}
    </AuthCard>
  );
}
