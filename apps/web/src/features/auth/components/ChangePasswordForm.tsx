"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, KeySquare, CheckCircle2 } from "lucide-react";
import { FormField, SubmitButton, ErrorAlert } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";
import { useChangePassword } from "../hooks";
import {
  changePasswordValidationSchema,
  ChangePasswordFormData,
  SecurityPolicy,
} from "../validations";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import { AuthResponseData } from "../types";

export interface ChangePasswordFormProps {
  policy?: Partial<SecurityPolicy>;
  onSuccess?: (data: AuthResponseData) => void;
}

export function ChangePasswordForm({
  policy,
  onSuccess,
}: ChangePasswordFormProps) {
  const { mutate: changePassword, isPending, error } = useChangePassword();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordValidationSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword") || "";

  const onSubmit = (values: ChangePasswordFormData) => {
    changePassword(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      },
      {
        onSuccess: (data) => {
          reset();
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
        label="Current Password"
        type="password"
        isPassword
        placeholder="Enter your current password"
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
        Change Password
      </SubmitButton>
    </form>
  );
}
