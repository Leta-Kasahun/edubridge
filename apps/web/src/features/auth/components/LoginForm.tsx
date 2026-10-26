"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Lock, ArrowRight } from "lucide-react";
import { FormField, SubmitButton, ErrorAlert } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";
import { ROUTES } from "@/constants/routes";
import { env } from "@/config/env";
import { useAuthStore } from "@/stores";
import { AuthUser } from "@/shared/types";
import { authService } from "../services";
import { useLogin } from "../hooks";
import { loginValidationSchema, LoginFormData } from "../validations";
import { AuthResponseData } from "../types";
import { GoogleButton } from "./GoogleButton";
import { KeycloakButton } from "./KeycloakButton";

export interface LoginFormProps {
  onSuccess?: (data: AuthResponseData) => void;
  onRequiresOtp?: (userId?: string) => void;
  onRequiresFirstLoginSetup?: (userId?: string) => void;
  onGoogleClick?: () => void;
  isGoogleLoading?: boolean;
  onKeycloakClick?: () => void;
  isKeycloakLoading?: boolean;
  forgotPasswordHref?: string;
}

function parseAuthData(param: string | null): { tokens?: { accessToken: string; expiresIn?: number }; user?: AuthUser } | null {
  if (!param) return null;
  try {
    const base64 = param.replace(/-/g, "+").replace(/_/g, "/");
    const padLength = (4 - (base64.length % 4)) % 4;
    const padded = base64 + "=".repeat(padLength);
    const binaryString = atob(padded);
    const bytes = Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes);
    return JSON.parse(decoded) as { tokens?: { accessToken: string; expiresIn?: number }; user?: AuthUser };
  } catch {
    return null;
  }
}

export function LoginForm({
  onSuccess,
  onRequiresOtp,
  onRequiresFirstLoginSetup,
  onGoogleClick,
  isGoogleLoading,
  onKeycloakClick,
  isKeycloakLoading,
  forgotPasswordHref = ROUTES.AUTH.RESET_PASSWORD,
}: LoginFormProps) {
  const [ssoError, setSsoError] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("error");
    }
    return null;
  });
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
    const keycloakSuccess = params.get("keycloak_success");
    const authError = params.get("error");
    const authDataParam = params.get("auth_data");

    if (authError) {
      window.history.replaceState(null, "", window.location.pathname);
      return;
    }

    if (googleSuccess !== "true" && keycloakSuccess !== "true") return;

    const parsedAuth = parseAuthData(authDataParam);
    if (parsedAuth?.user && parsedAuth?.tokens?.accessToken) {
      window.history.replaceState(null, "", window.location.pathname);
      setAuth({
        user: parsedAuth.user,
        accessToken: parsedAuth.tokens.accessToken,
        expiresIn: parsedAuth.tokens.expiresIn,
        tenantId: parsedAuth.user.tenantId,
      });
      if (onSuccess) {
        onSuccess({
          tokens: parsedAuth.tokens,
          user: parsedAuth.user,
        });
      }
      return;
    }

    window.history.replaceState(null, "", window.location.pathname);

    authService
      .refreshSession()
      .then((data) => {
        if (data.user && data.tokens) {
          setAuth({
            user: data.user as AuthUser,
            accessToken: data.tokens.accessToken,
            expiresIn: data.tokens.expiresIn,
            tenantId: data.user.tenantId,
          });
          if (onSuccess) {
            onSuccess(data);
          }
        }
      })
      .catch(() => {
        setSsoError("Authentication failed. Please try again.");
      });
  }, [onSuccess, setAuth]);

  const onSubmit = (values: LoginFormData) => {
    setSsoError(null);
    const identifier = values.email.trim();
    const isEmail = identifier.includes("@");

    login(
      {
        email: isEmail ? identifier : undefined,
        identifier: identifier,
        password: values.password,
      },
      {
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
      }
    );
  };

  const handleGoogleClick = () => {
    setSsoError(null);
    if (onGoogleClick) {
      onGoogleClick();
      return;
    }

    const originParam = typeof window !== "undefined" ? `?origin=${encodeURIComponent(window.location.origin)}` : "";
    window.location.href = `${env.apiUrl}/auth/google${originParam}`;
  };

  const handleKeycloakClick = () => {
    setSsoError(null);
    if (onKeycloakClick) {
      onKeycloakClick();
      return;
    }

    const originParam = typeof window !== "undefined" ? `?origin=${encodeURIComponent(window.location.origin)}` : "";
    window.location.href = `${env.apiUrl}/auth/keycloak${originParam}`;
  };

  const currentError = error ? getErrorMessage(error) : ssoError;

  return (
    <div className="space-y-4 sm:space-y-5 w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5 w-full">
        {currentError && <ErrorAlert message={currentError} />}

        <FormField
          id="email"
          label="Email or Username"
          type="text"
          placeholder="Enter your email or username"
          autoComplete="username"
          leftIcon={<User size={18} />}
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

      <div className="relative flex items-center justify-center py-1">
        <div className="border-t border-border/80 w-full" />
        <span className="bg-card px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest absolute">
          Or continue with
        </span>
      </div>

      <div className="flex flex-col gap-2.5 sm:gap-3 w-full">
        <KeycloakButton
          onClick={handleKeycloakClick}
          isLoading={isKeycloakLoading}
        />
        <GoogleButton
          onClick={handleGoogleClick}
          isLoading={isGoogleLoading}
        />
      </div>

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
