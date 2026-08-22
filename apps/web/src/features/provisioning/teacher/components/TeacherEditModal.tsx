"use client";

import { useState } from "react";
import { X, User, Phone, Mail, Save } from "lucide-react";
import { FormField } from "@/shared/components/FormField";
import { SubmitButton } from "@/shared/components/SubmitButton";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import { cn } from "@/lib/utils";
import { useUpdateTeacher } from "../hooks/useTeacherManagement";
import {
  TeacherRecord,
  TeacherGender,
  TeacherStatus,
} from "../types/teacher-provisioning.types";

export interface TeacherEditModalProps {
  readonly teacher: TeacherRecord;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSuccess?: () => void;
}

export function TeacherEditModal({
  teacher,
  isOpen,
  onClose,
  onSuccess,
}: TeacherEditModalProps) {
  const [firstName, setFirstName] = useState(teacher.firstName);
  const [middleName, setMiddleName] = useState(teacher.middleName);
  const [lastName, setLastName] = useState(teacher.lastName);
  const [gender, setGender] = useState<TeacherGender>(teacher.gender);
  const [email, setEmail] = useState(teacher.email || "");
  const [phoneNumber, setPhoneNumber] = useState(teacher.phoneNumber || "");
  const [status, setStatus] = useState<TeacherStatus>(teacher.teacherStatus);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useUpdateTeacher();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!firstName.trim() || !middleName.trim() || !lastName.trim()) {
      setErrorMessage("All three Ethiopian name parts are required");
      return;
    }

    try {
      await mutation.mutateAsync({
        id: teacher.teacherProfileId,
        payload: {
          firstName: firstName.trim(),
          middleName: middleName.trim(),
          lastName: lastName.trim(),
          gender,
          email: email.trim() || undefined,
          phoneNumber: phoneNumber.trim() || undefined,
          status,
        },
      });

      if (onSuccess) {
        onSuccess();
      }
      onClose();
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
      setErrorMessage(
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error?.message ||
        "Failed to update teacher profile"
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-card rounded-2xl border border-border shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-foreground">Edit Teacher Profile</h2>
            <div className="text-xs text-muted-foreground font-mono">{teacher.employeeCode} • {teacher.username}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMessage && <ErrorAlert message={errorMessage} />}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField
              id="editFirstName"
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              leftIcon={<User size={16} />}
              required
            />
            <FormField
              id="editMiddleName"
              label="Middle Name"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              leftIcon={<User size={16} />}
              required
            />
            <FormField
              id="editLastName"
              label="Grandfather Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              leftIcon={<User size={16} />}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Gender
              </label>
              <div className="grid grid-cols-2 gap-2 h-11">
                <button
                  type="button"
                  onClick={() => setGender("FEMALE")}
                  className={cn(
                    "h-full px-3 flex items-center justify-center text-xs font-semibold rounded-none border transition-all cursor-pointer",
                    gender === "FEMALE"
                      ? "border-2 border-primary text-primary bg-primary/5 font-bold"
                      : "border-border text-muted-foreground hover:text-foreground bg-background/50"
                  )}
                >
                  Female
                </button>
                <button
                  type="button"
                  onClick={() => setGender("MALE")}
                  className={cn(
                    "h-full px-3 flex items-center justify-center text-xs font-semibold rounded-none border transition-all cursor-pointer",
                    gender === "MALE"
                      ? "border-2 border-primary text-primary bg-primary/5 font-bold"
                      : "border-border text-muted-foreground hover:text-foreground bg-background/50"
                  )}
                >
                  Male
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TeacherStatus)}
                className="w-full h-11 px-3 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-hidden focus:border-primary transition-colors"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="TRANSFERRED">Transferred</option>
                <option value="RESIGNED">Resigned</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              id="editEmail"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={16} />}
            />
            <FormField
              id="editPhone"
              label="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              leftIcon={<Phone size={16} />}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <SubmitButton
              isLoading={mutation.isPending}
              loadingText="Saving..."
              icon={<Save size={16} />}
              iconPosition="left"
              className="px-5 py-2 text-xs"
            >
              Save Changes
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
