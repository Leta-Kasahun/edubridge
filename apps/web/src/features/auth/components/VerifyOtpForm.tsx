"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, RotateCw, CheckCircle2 } from "lucide-react";
import { FormField, SubmitButton, ErrorAlert } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";
import { useVerifyOtp, useResendOtp } from "../hooks";
import { verifyOtpValidationSchema, VerifyOtpFormData } from "../validations";
import { AuthResponseData, OtpPurpose } from "../types";

export interface VerifyOtpFormProps {
  userId?: string;
  email?: string;
  purpose?: OtpPurpose;
  onSuccess?: (data: AuthResponseData) => void;
}

export function VerifyOtpForm({
  userId,
  email,
  purpose = "LOGIN_2FA",
  onSuccess,
}: VerifyOtpFormProps) {
  const [cooldown, setCooldown] = useState(30);
  const { mutate: verifyOtp, isPending, error } = useVerifyOtp();
  const {
    mutate: resendOtp,
    isPending: isResending,
    error: resendError,
  } = useResendOtp();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpValidationSchema),
    defaultValues: {
      otp: "",
    },
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const onSubmit = (values: VerifyOtpFormData) => {
    verifyOtp(
      {
        otp: values.otp,
        userId,
        email,
        purpose,
      },
      {
        onSuccess: (data) => {
          if (onSuccess) {
            onSuccess(data);
          }
        },
      }
    );
  };

  const handleResend = () => {
    if (cooldown > 0 || isResending) return;
    resendOtp(
      { userId, email, purpose },
      {
        onSuccess: () => {
          setCooldown(30);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 w-full">
      {(error || resendError) && (
        <ErrorAlert message={getErrorMessage(error || resendError)} />
      )}

      <FormField
        id="otp"
        label="6-Digit Verification Code"
        type="text"
        maxLength={6}
        placeholder="••••••"
        autoComplete="one-time-code"
        inputMode="numeric"
        leftIcon={<KeyRound size={18} />}
        className="text-center tracking-[0.4em] sm:tracking-[0.6em] text-lg sm:text-xl font-mono font-bold"
        error={errors.otp?.message}
        {...register("otp")}
      />

      <SubmitButton
        isLoading={isPending}
        loadingText="Verifying code..."
        icon={<CheckCircle2 size={18} />}
        iconPosition="right"
      >
        Verify Code
      </SubmitButton>

      <div className="flex items-center justify-center text-xs sm:text-sm pt-2">
        {cooldown > 0 ? (
          <span className="text-muted-foreground">
            Resend code in <strong className="text-foreground font-semibold">{cooldown}s</strong>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-primary hover:text-primary/80 font-semibold inline-flex items-center gap-1.5 transition-colors active:scale-95"
          >
            <RotateCw size={14} className={isResending ? "animate-spin" : ""} />
            <span>Resend Verification Code</span>
          </button>
        )}
      </div>
    </form>
  );
}
