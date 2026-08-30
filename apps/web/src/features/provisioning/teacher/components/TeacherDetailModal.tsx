"use client";

import { X } from "lucide-react";
import {
  formatPhoneDisplay,
  formatDisplayDate,
  formatStudentAccountStatus,
} from "@/shared/utils";
import { TeacherRecord } from "../types/teacher-provisioning.types";

export interface TeacherDetailModalProps {
  readonly teacher: TeacherRecord;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function TeacherDetailModal({
  teacher,
  isOpen,
  onClose,
}: TeacherDetailModalProps) {
  if (!isOpen) return null;

  const fullName = [teacher.firstName, teacher.middleName, teacher.lastName]
    .filter(Boolean)
    .join(" ");

  const formattedCreatedAt = teacher.createdAt
    ? formatDisplayDate(teacher.createdAt)
    : null;

  const formattedAccountStatus = formatStudentAccountStatus(teacher.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl sm:max-w-2xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border bg-card">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
              {fullName}
            </h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span className="font-mono font-semibold text-foreground">{teacher.employeeCode}</span>
              <span>•</span>
              <span className="font-medium text-muted-foreground">Teacher</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 max-h-[calc(85vh-120px)] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="p-3.5 rounded-xl border border-border bg-background/50">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Full Name
              </span>
              <span className="text-sm font-medium text-foreground mt-1 block">
                {fullName}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-background/50">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Email Address
              </span>
              <span className="text-sm font-medium text-foreground mt-1 block truncate" title={teacher.email || ""}>
                {teacher.email || "Not registered"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-background/50">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Phone Number
              </span>
              <span className="text-sm font-medium font-mono text-foreground mt-1 block">
                {formatPhoneDisplay(teacher.phoneNumber || "") || "Not registered"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-background/50">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Assigned Username
              </span>
              <span className="text-sm font-bold font-mono text-foreground mt-1 block">
                {teacher.username}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-background/50">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Employee Code
              </span>
              <span className="text-sm font-medium font-mono text-foreground mt-1 block">
                {teacher.employeeCode}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-background/50">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Gender
              </span>
              <span className="text-sm font-medium uppercase text-foreground mt-1 block">
                {teacher.gender}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-background/50">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Teaching Status
              </span>
              <span className="text-sm font-medium text-foreground mt-1 block">
                {teacher.teacherStatus === "ACTIVE" ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-background/50">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Account Status
              </span>
              <span className="text-sm font-medium text-foreground mt-1 block">
                {formattedAccountStatus}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-background/50">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Email Verification
              </span>
              <span className="text-sm font-medium text-foreground mt-1 block">
                {teacher.emailVerified ? "Verified" : "Pending Verification"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-background/50">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Role
              </span>
              <span className="text-sm font-medium text-foreground mt-1 block">
                Teacher
              </span>
            </div>

            {formattedCreatedAt && (
              <div className="p-3.5 rounded-xl border border-border bg-background/50 sm:col-span-2">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Provisioned Date
                </span>
                <span className="text-sm font-medium text-foreground mt-1 block">
                  {formattedCreatedAt}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end px-5 sm:px-6 py-3.5 border-t border-border bg-muted/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
