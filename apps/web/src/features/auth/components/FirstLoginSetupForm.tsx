"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, KeySquare, CheckCircle2, Mail, User } from "lucide-react";
import { FormField, SubmitButton, ErrorAlert } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";
import { useFirstLoginSetup } from "../hooks";
import {
  firstLoginSetupValidationSchema,
  FirstLoginSetupFormData,
  FirstLoginMode,
  SecurityPolicy,
} from "../validations";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import { AuthIdentifierToggle } from "./AuthIdentifierToggle";
import { AuthResponseData } from "../types";

export interface FirstLoginSetupFormProps {
  readonly initialEmail?: string;
  readonly initialUsername?: string;
  readonly initialMode?: FirstLoginMode;
  readonly userId?: string;
  readonly policy?: Partial<SecurityPolicy>;
  readonly onSuccess?: (data: AuthResponseData) => void;
}

export function FirstLoginSetupForm({
  initialEmail = "",
  initialUsername = "",
  initialMode,
  userId,
  policy,
  onSuccess,
}: FirstLoginSetupFormProps) {
  const defaultMode: FirstLoginMode =
    initialMode || (initialUsername ? "USERNAME" : "EMAIL");

  const [mode, setMode] = useState<FirstLoginMode>(defaultMode);
  const { mutate: firstLoginSetup, isPending, error } = useFirstLoginSetup();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FirstLoginSetupFormData>({
    resolver: zodResolver(firstLoginSetupValidationSchema),
    defaultValues: {
      mode: defaultMode,
      email: initialEmail,
      username: initialUsername,
      otp: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword") || "";

  const handleModeChange = (newMode: FirstLoginMode) => {
    setMode(newMode);
    setValue("mode", newMode, { shouldValidate: false });
  };

  const onSubmit = (values: FirstLoginSetupFormData) => {
    const payload = {
      userId,
      email: mode === "EMAIL" ? values.email?.trim() : undefined,
      username: mode === "USERNAME" ? values.username?.trim() : undefined,
      identifier: mode === "USERNAME" ? values.username?.trim() : undefined,
      otp: mode === "EMAIL" ? values.otp?.trim() : undefined,
      currentPassword:
        mode === "USERNAME" ? values.currentPassword : undefined,
      newPassword: values.newPassword,
    };

    firstLoginSetup(payload, {
      onSuccess: (data) => {
        if (onSuccess) {
          onSuccess(data);
        }
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5 w-full">
      {error && (
        <ErrorAlert
          message={getErrorMessage(
            error,
            "Failed to complete setup. Please check your details and try again."
          )}
        />
      )}

      <AuthIdentifierToggle
        mode={mode === "EMAIL" ? "email" : "username"}
        onChange={(m) => handleModeChange(m === "email" ? "EMAIL" : "USERNAME")}
      />

      {mode === "EMAIL" && (
        <>
          <FormField
            id="email"
            label="Email Address"
            type="email"
            placeholder="Enter your email address"
            autoComplete="email"
            leftIcon={<Mail size={18} />}
            error={errors.email?.message}
            {...register("email")}
          />

          <FormField
            id="otp"
            label="Verification Code (OTP)"
            type="text"
            placeholder="Enter 6-digit verification code"
            maxLength={6}
            autoComplete="one-time-code"
            leftIcon={<KeySquare size={18} />}
            error={errors.otp?.message}
            {...register("otp")}
          />
        </>
      )}

      {mode === "USERNAME" && (
        <>
          <FormField
            id="username"
            label="Username"
            type="text"
            placeholder="Enter your assigned username"
            autoComplete="username"
            leftIcon={<User size={18} />}
            error={errors.username?.message}
            {...register("username")}
          />

          <FormField
            id="currentPassword"
            label="Temporary Password"
            type="password"
            isPassword
            placeholder="Enter your temporary password"
            autoComplete="current-password"
            leftIcon={<KeySquare size={18} />}
            error={errors.currentPassword?.message}
            {...register("currentPassword")}
          />
        </>
      )}

      <div className="space-y-2">
        <FormField
          id="newPassword"
          label="New Password"
          type="password"
          isPassword
          placeholder="Create your new password"
          autoComplete="new-password"
          leftIcon={<Lock size={18} />}
          error={errors.newPassword?.message}
          {...register("newPassword")}
        />
        <PasswordStrengthIndicator password={newPassword} policy={policy} />
      </div>

      <FormField
        id="confirmPassword"
        label="Confirm New Password"
        type="password"
        isPassword
        placeholder="Re-enter your new password"
        autoComplete="new-password"
        leftIcon={<Lock size={18} />}
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <SubmitButton
        isLoading={isPending}
        loadingText="Activating Account..."
        icon={<CheckCircle2 size={18} />}
        iconPosition="right"
        className="w-full"
      >
        Set Password & Activate
      </SubmitButton>
    </form>
  );
}
