"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, User, Lock, ArrowRight } from "lucide-react";
import { FormField, SubmitButton, ErrorAlert } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";
import { ROUTES } from "@/constants/routes";
import { env } from "@/config/env";
import { useAuthStore } from "@/stores";
import { setAuthTokens } from "@/lib/apiClient";
import { AuthUser } from "@/shared/types";
import { useLogin } from "../hooks";
import { loginValidationSchema, LoginFormData } from "../validations";
import { AuthResponseData } from "../types";
import { GoogleButton } from "./GoogleButton";
import { AuthIdentifierToggle, AuthIdentifierMode } from "./AuthIdentifierToggle";

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
  const [authMode, setAuthMode] = useState<AuthIdentifierMode>("email");
  const [googleError, setGoogleError] = useState<string | null>(null);
  const setAuth = useAuthStore((state) => state.setAuth);
  const { mutate: login, isPending, error } = useLogin();

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

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const googleSuccess = params.get("google_success");
    const token = params.get("token");
    const expiresIn = params.get("expiresIn");
    const userDataRaw = params.get("userData");
    const authError = params.get("error");

    if (authError) {
      setGoogleError(authError);
      window.history.replaceState(null, "", window.location.pathname);
      return;
    }

    if (googleSuccess === "true" && token) {
      let parsedUser: AuthUser | null = null;
      if (userDataRaw) {
        try {
          parsedUser = JSON.parse(decodeURIComponent(userDataRaw)) as AuthUser;
        } catch {
          parsedUser = null;
        }
      }

      const numExpiresIn = expiresIn ? Number(expiresIn) : 900;
      setAuthTokens(token, numExpiresIn);

      if (parsedUser) {
        setAuth({
          user: parsedUser,
          accessToken: token,
          expiresIn: numExpiresIn,
        });
      }

      window.history.replaceState(null, "", window.location.pathname);
      if (onSuccess) {
        onSuccess({
          tokens: { accessToken: token, expiresIn: numExpiresIn },
          user: parsedUser ?? undefined,
        });
      }
    }
  }, [onSuccess, setAuth]);

  const onSubmit = (values: LoginFormData) => {
    setGoogleError(null);
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
    setGoogleError(null);
    if (onGoogleClick) {
      onGoogleClick();
      return;
    }

    window.location.href = `${env.apiUrl}/auth/google`;
  };

  const currentError = error ? getErrorMessage(error) : googleError;

  return (
    <div className="space-y-5 w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 w-full">
        {currentError && <ErrorAlert message={currentError} />}

        <AuthIdentifierToggle mode={authMode} onChange={setAuthMode} />

        <FormField
          id="email"
          label={authMode === "email" ? "Email Address" : "Username"}
          type={authMode === "email" ? "email" : "text"}
          placeholder={authMode === "email" ? "Enter your email address" : "Enter your username"}
          autoComplete={authMode === "email" ? "email" : "username"}
          leftIcon={authMode === "email" ? <Mail size={18} /> : <User size={18} />}
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
        isLoading={isGoogleLoading}
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
