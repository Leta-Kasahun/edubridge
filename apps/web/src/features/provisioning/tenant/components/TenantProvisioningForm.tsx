"use client";

import { useState } from "react";
import { Building2, User, Mail, Send, KeyRound } from "lucide-react";
import { FormField } from "@/shared/components/FormField";
import { SubmitButton } from "@/shared/components/SubmitButton";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import { cn } from "@/lib/utils";
import { useProvisionSchoolAdmin } from "../hooks/useTenantProvisioning";
import {
  ProvisioningMethod,
  ProvisionSchoolAdminResult,
} from "../types/tenant-provisioning.types";

export interface TenantProvisioningFormProps {
  readonly onSuccess: (result: ProvisionSchoolAdminResult) => void;
}

export function TenantProvisioningForm({
  onSuccess,
}: TenantProvisioningFormProps) {
  const [method, setMethod] = useState<ProvisioningMethod>("INVITATION");
  const [tenantName, setTenantName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const mutation = useProvisionSchoolAdmin();

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!tenantName.trim()) {
      errors.tenantName = "School name is required";
    }

    if (!firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (method === "INVITATION") {
      if (!email.trim()) {
        errors.email = "Email address is required for invitation delivery";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Please enter a valid email address";
      }
    } else if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) return;

    try {
      const result = await mutation.mutateAsync({
        method,
        tenantName: tenantName.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
      });

      onSuccess(result);
    } catch (err: unknown) {
      const axiosError = err as {
        response?: {
          data?: {
            message?: string;
            error?: { message?: string };
          };
        };
        message?: string;
      };
      const msg =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error?.message ||
        (axiosError.message && !axiosError.message.includes("status code")
          ? axiosError.message
          : "Unable to create school. Please verify the school information and try again.");
      setErrorMessage(msg);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-card rounded-2xl border border-border p-5 sm:p-7 shadow-xs">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-foreground">
            Add New School
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create school partition and assign the primary administrator
          </p>
        </div>

        {errorMessage && <ErrorAlert message={errorMessage} />}

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80 select-none">
            Provisioning Method
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setMethod("INVITATION");
                setFieldErrors((prev) => ({ ...prev, email: "" }));
              }}
              className={cn(
                "flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer",
                method === "INVITATION"
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border hover:bg-muted/40"
              )}
            >
              <div
                className={cn(
                  "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                  method === "INVITATION"
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Mail size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-foreground block">
                  Email Invitation
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">
                  Sends credentials and 48-hour access code
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setMethod("DIRECT_CREDENTIALS");
                setFieldErrors((prev) => ({ ...prev, email: "" }));
              }}
              className={cn(
                "flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer",
                method === "DIRECT_CREDENTIALS"
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border hover:bg-muted/40"
              )}
            >
              <div
                className={cn(
                  "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                  method === "DIRECT_CREDENTIALS"
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <KeyRound size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-foreground block">
                  Direct Credentials
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">
                  Display one-time username and password
                </span>
              </div>
            </button>
          </div>
        </div>

        <div className="space-y-4 pt-1">
          <FormField
            id="tenantName"
            label="School Name"
            placeholder="e.g. Apex Academy"
            value={tenantName}
            onChange={(e) => {
              setTenantName(e.target.value);
              if (fieldErrors.tenantName) {
                setFieldErrors((prev) => ({ ...prev, tenantName: "" }));
              }
            }}
            error={fieldErrors.tenantName}
            leftIcon={<Building2 size={18} />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              id="firstName"
              label="Admin First Name"
              placeholder="First name"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                if (fieldErrors.firstName) {
                  setFieldErrors((prev) => ({ ...prev, firstName: "" }));
                }
              }}
              error={fieldErrors.firstName}
              leftIcon={<User size={18} />}
            />

            <FormField
              id="lastName"
              label="Admin Last Name"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                if (fieldErrors.lastName) {
                  setFieldErrors((prev) => ({ ...prev, lastName: "" }));
                }
              }}
              error={fieldErrors.lastName}
              leftIcon={<User size={18} />}
            />
          </div>

          <FormField
            id="email"
            type="email"
            label={method === "INVITATION" ? "Admin Email Address" : "Admin Email Address (Optional)"}
            placeholder="admin@school.edu.et"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({ ...prev, email: "" }));
              }
            }}
            error={fieldErrors.email}
            leftIcon={<Mail size={18} />}
          />
        </div>

        <div className="pt-2">
          <SubmitButton
            isLoading={mutation.isPending}
            loadingText="Onboarding School..."
            icon={<Send size={16} />}
            className="w-full"
          >
            {method === "INVITATION" ? "Send Invitation" : "Create School Administrator"}
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
