"use client";

import { useState } from "react";
import { User, Mail, Phone, BadgeCheck, Send, KeyRound } from "lucide-react";
import { FormField } from "@/shared/components/FormField";
import { SubmitButton } from "@/shared/components/SubmitButton";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import { cn } from "@/lib/utils";
import { useProvisionTeacher } from "../hooks/useTeacherProvisioning";
import {
  TeacherProvisioningMethod,
  TeacherGender,
  TeacherProvisionResult,
} from "../types/teacher-provisioning.types";

export interface TeacherProvisioningFormProps {
  readonly onSuccess: (result: TeacherProvisionResult) => void;
}

export function TeacherProvisioningForm({
  onSuccess,
}: TeacherProvisioningFormProps) {
  const [method, setMethod] = useState<TeacherProvisioningMethod>("INVITATION");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<TeacherGender>("FEMALE");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const mutation = useProvisionTeacher();

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!middleName.trim()) {
      errors.middleName = "Middle name is required";
    }

    if (!lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (method === "INVITATION") {
      if (!email.trim()) {
        errors.email = "Email address is required for invitation";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Please enter a valid email address";
      }
    } else if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (phoneNumber.trim() && !/^\+?[0-9\s-]{9,20}$/.test(phoneNumber)) {
      errors.phoneNumber = "Please enter a valid phone number";
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
        firstName: firstName.trim(),
        middleName: middleName.trim(),
        lastName: lastName.trim(),
        gender,
        email: email.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        employeeCode: employeeCode.trim() || undefined,
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
          : "Unable to provision teacher. Please verify the details and try again.");
      setErrorMessage(msg);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-card rounded-2xl border border-border p-5 sm:p-7 shadow-xs">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setMethod("INVITATION");
                setFieldErrors((prev) => {
                  const next = { ...prev };
                  delete next.email;
                  return next;
                });
              }}
              className={cn(
                "h-11 sm:h-12 px-4 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold tracking-wide uppercase transition-all duration-200 cursor-pointer rounded-xl active:scale-[0.99]",
                method === "INVITATION"
                  ? "border-2 border-primary text-primary bg-primary/5 font-bold"
                  : "border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 bg-background/50"
              )}
            >
              <Send size={18} className="shrink-0" />
              <span>Email Invitation</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMethod("DIRECT_CREDENTIALS");
                setFieldErrors((prev) => {
                  const next = { ...prev };
                  delete next.email;
                  return next;
                });
              }}
              className={cn(
                "h-11 sm:h-12 px-4 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold tracking-wide uppercase transition-all duration-200 cursor-pointer rounded-xl active:scale-[0.99]",
                method === "DIRECT_CREDENTIALS"
                  ? "border-2 border-primary text-primary bg-primary/5 font-bold"
                  : "border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 bg-background/50"
              )}
            >
              <KeyRound size={18} className="shrink-0" />
              <span>Direct Credentials</span>
            </button>
          </div>
        </div>

        {errorMessage && <ErrorAlert message={errorMessage} />}

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              id="firstName"
              label="First Name"
              placeholder="e.g. Almaz"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                if (fieldErrors.firstName) {
                  setFieldErrors((prev) => ({ ...prev, firstName: "" }));
                }
              }}
              leftIcon={<User size={18} />}
              error={fieldErrors.firstName}
              required
            />

            <FormField
              id="middleName"
              label="Middle Name"
              placeholder="e.g. Tadesse"
              value={middleName}
              onChange={(e) => {
                setMiddleName(e.target.value);
                if (fieldErrors.middleName) {
                  setFieldErrors((prev) => ({ ...prev, middleName: "" }));
                }
              }}
              leftIcon={<User size={18} />}
              error={fieldErrors.middleName}
              required
            />

            <FormField
              id="lastName"
              label="Last Name"
              placeholder="e.g. Haile"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                if (fieldErrors.lastName) {
                  setFieldErrors((prev) => ({ ...prev, lastName: "" }));
                }
              }}
              leftIcon={<User size={18} />}
              error={fieldErrors.lastName}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 w-full">
              <label
                htmlFor="teacherGenderSelect"
                className="text-xs font-semibold uppercase tracking-wider text-foreground/80 select-none block"
              >
                Gender <span className="text-primary">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center pointer-events-none text-muted-foreground/80">
                  <User size={18} />
                </div>
                <select
                  id="teacherGenderSelect"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as TeacherGender)}
                  className="h-11 sm:h-12 w-full rounded-xl border border-input bg-background/50 pl-11 pr-3.5 text-sm sm:text-base font-normal shadow-xs transition-all duration-200 focus-visible:bg-background focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 text-foreground cursor-pointer focus:outline-hidden"
                >
                  <option value="FEMALE">Female</option>
                  <option value="MALE">Male</option>
                </select>
              </div>
            </div>

            <FormField
              id="employeeCode"
              label="Employee Code"
              placeholder="Auto-generated if empty"
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value)}
              leftIcon={<BadgeCheck size={18} />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              id="email"
              label={method === "INVITATION" ? "Email Address" : "Email Address (Optional)"}
              type="email"
              placeholder="teacher@school.edu.et"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: "" }));
                }
              }}
              leftIcon={<Mail size={18} />}
              error={fieldErrors.email}
              required={method === "INVITATION"}
            />

            <FormField
              id="phoneNumber"
              label="Phone Number"
              placeholder="+251 91 123 4567"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                if (fieldErrors.phoneNumber) {
                  setFieldErrors((prev) => ({ ...prev, phoneNumber: "" }));
                }
              }}
              leftIcon={<Phone size={18} />}
              error={fieldErrors.phoneNumber}
            />
          </div>
        </div>

        <SubmitButton
          isLoading={mutation.isPending}
          loadingText={method === "INVITATION" ? "Sending Invitation..." : "Creating Account..."}
          icon={method === "INVITATION" ? <Send size={18} /> : <KeyRound size={18} />}
          iconPosition="right"
          className="w-full h-11 sm:h-12 text-sm sm:text-base rounded-xl font-semibold"
        >
          {method === "INVITATION" ? "Invite Teacher" : "Generate Credentials"}
        </SubmitButton>
      </form>
    </div>
  );
}
