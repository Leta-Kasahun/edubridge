"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { FormField, SubmitButton, ErrorAlert } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";
import { ROUTES } from "@/constants/routes";
import { useLogin, useGoogleAuth } from "../hooks";
import { loginValidationSchema, LoginFormData } from "../validations";
import { AuthResponseData } from "../types";
import { GoogleButton } from "./GoogleButton";

export interface LoginFormProps {
  onSuccess?: (data: AuthResponseData) => void;
  onRequiresOtp?: (userId?: string) => void;
  onRequiresFirstLoginSetup?: (userId?: string) => void;
  onGoogleClick?: () => void;
  isGoogleLoading?: boolean;
  forgotPasswordHref?: string;
}

export function LoginForm({
  onSuccess,
  onRequiresOtp,
  onRequiresFirstLoginSetup,
  onGoogleClick,
  isGoogleLoading,
  forgotPasswordHref = ROUTES.AUTH.RESET_PASSWORD,
}: LoginFormProps) {
  const { mutate: login, isPending, error } = useLogin();
  const { mutate: googleLogin, isPending: isGoogleAuthPending } = useGoogleAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginValidationSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: LoginFormData) => {
    login(values, {
      onSuccess: (data) => {
        if (data.requiresOtp && onRequiresOtp) {
          onRequiresOtp(data.userId);
          return;
        }
        if (data.requiresFirstLoginSetup && onRequiresFirstLoginSetup) {
          onRequiresFirstLoginSetup(data.userId);
          return;
        }
        if (onSuccess) {
          onSuccess(data);
        }
      },
    });
  };

  const handleGoogleClick = () => {
    if (onGoogleClick) {
      onGoogleClick();
      return;
    }
  };

  return (
    <div className="space-y-5 w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 w-full">
        {error && <ErrorAlert message={getErrorMessage(error)} />}

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

        <FormField
          id="password"
          label="Password"
          action={
            <Link
              href={forgotPasswordHref}
              className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Forgot password?
            </Link>
          }
          type="password"
          isPassword
          placeholder="Enter your password"
          autoComplete="current-password"
          leftIcon={<Lock size={18} />}
          error={errors.password?.message}
          {...register("password")}
        />

        <SubmitButton
          isLoading={isPending}
          loadingText="Signing in..."
          icon={<ArrowRight size={18} />}
          iconPosition="right"
        >
          Sign In
        </SubmitButton>
      </form>

      <div className="relative flex items-center justify-center py-2">
        <div className="border-t border-border/80 w-full" />
        <span className="bg-card px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest absolute">
          Or continue with
        </span>
      </div>

      <GoogleButton
        onClick={handleGoogleClick}
        isLoading={isGoogleLoading || isGoogleAuthPending}
      />

      <div className="pt-2 text-center text-xs sm:text-sm text-muted-foreground">
        <span>First time login? </span>
        <Link
          href={ROUTES.AUTH.FIRST_LOGIN_SETUP}
          className="font-semibold text-primary hover:underline ml-1"
        >
          First Login Setup
        </Link>
      </div>
    </div>
  );
}
