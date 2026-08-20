"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, KeySquare, CheckCircle2 } from "lucide-react";
import { FormField, SubmitButton, ErrorAlert } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";
import { useFirstLoginSetup } from "../hooks";
import {
  firstLoginSetupValidationSchema,
  FirstLoginSetupFormData,
  SecurityPolicy,
} from "../validations";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import { AuthResponseData } from "../types";

export interface FirstLoginSetupFormProps {
  email: string;
  userId?: string;
  policy?: Partial<SecurityPolicy>;
  onSuccess?: (data: AuthResponseData) => void;
}

export function FirstLoginSetupForm({
  email,
  userId,
  policy,
  onSuccess,
}: FirstLoginSetupFormProps) {
  const { mutate: firstLoginSetup, isPending, error } = useFirstLoginSetup();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FirstLoginSetupFormData>({
    resolver: zodResolver(firstLoginSetupValidationSchema),
    defaultValues: {
      email,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword") || "";

  const onSubmit = (values: FirstLoginSetupFormData) => {
    firstLoginSetup(
      {
        email,
        userId,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5 w-full">
      {error && <ErrorAlert message={getErrorMessage(error)} />}

      <FormField
        id="currentPassword"
        label="Temporary / Current Password"
        type="password"
        isPassword
        placeholder="Enter your temporary password"
        autoComplete="current-password"
        leftIcon={<KeySquare size={18} />}
        error={errors.currentPassword?.message}
        {...register("currentPassword")}
      />

      <div className="space-y-2">
        <FormField
          id="newPassword"
          label="New Password"
          type="password"
          isPassword
          placeholder="Enter a strong new password"
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
        loadingText="Updating password..."
        icon={<CheckCircle2 size={18} />}
        iconPosition="right"
      >
        Set Password & Continue
      </SubmitButton>
    </form>
  );
}
