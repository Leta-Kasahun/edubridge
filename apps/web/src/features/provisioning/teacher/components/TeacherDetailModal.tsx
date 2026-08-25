"use client";

import { X } from "lucide-react";
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

  const formattedCreatedAt = teacher.createdAt
    ? new Date(teacher.createdAt).toLocaleDateString()
    : null;

  const formattedAccountStatus =
    teacher.status === "PENDING_FIRST_LOGIN"
      ? "Pending Setup"
      : teacher.status === "ACTIVE"
      ? "Active"
      : teacher.status === "SUSPENDED"
      ? "Suspended"
      : teacher.status;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl sm:max-w-2xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border bg-card">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
              {teacher.firstName} {teacher.middleName} {teacher.lastName}
            </h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span className="font-mono font-semibold text-foreground">{teacher.employeeCode}</span>
              <span>•</span>
              <span className="font-medium text-muted-foreground">Faculty & Teacher</span>
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

        <div className="p-4 sm:p-6 space-y-4 max-h-[calc(85vh-120px)] overflow-y-auto text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="p-3 rounded-xl bg-background/50 border border-border space-y-1">
              <div className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
                Teaching Status
              </div>
              <div className="font-medium text-foreground text-xs">
                {teacher.teacherStatus === "ACTIVE" ? "Active" : "Inactive"}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-background/50 border border-border space-y-1">
              <div className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
                Account Status
              </div>
              <div className="font-medium text-foreground text-xs truncate" title={teacher.status}>
                {formattedAccountStatus}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-background/50 border border-border space-y-1">
              <div className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
                Gender
              </div>
              <div className="font-semibold text-foreground uppercase text-xs">
                {teacher.gender}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-background/50 border border-border space-y-1">
              <div className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
                Verification
              </div>
              <div className="font-medium text-foreground text-xs">
                {teacher.emailVerified ? "Verified" : "Pending"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-3 p-4 rounded-xl bg-background/50 border border-border">
              <div className="font-semibold text-foreground pb-1 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                Account & Authentication
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Assigned Username</span>
                  <span className="font-mono font-bold text-foreground">
                    {teacher.username}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Employee Code</span>
                  <span className="font-mono font-medium text-foreground">
                    {teacher.employeeCode}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Profile Identifier</span>
                  <span className="font-mono text-[11px] text-muted-foreground truncate max-w-[130px]" title={teacher.teacherProfileId}>
                    {teacher.teacherProfileId.slice(0, 8)}...
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-background/50 border border-border">
              <div className="font-semibold text-foreground pb-1 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                Contact Details
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email Address</span>
                  <span className="font-medium text-foreground truncate max-w-[160px]" title={teacher.email || ""}>
                    {teacher.email || "Not registered"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Phone Number</span>
                  <span className="font-medium text-foreground">
                    {teacher.phoneNumber || "Not registered"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Setup Status</span>
                  <span className="font-medium text-foreground">
                    {teacher.emailVerified ? "Setup Confirmed" : "Pending Setup"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 p-4 rounded-xl bg-background/50 border border-border">
            <div className="font-semibold text-foreground pb-1 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              Identity & Provisioning Information
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-card/60 border border-border/70">
                <span className="text-muted-foreground">Full Name</span>
                <span className="font-medium text-foreground">
                  {teacher.firstName} {teacher.middleName} {teacher.lastName}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-card/60 border border-border/70">
                <span className="text-muted-foreground">Role Assigned</span>
                <span className="font-medium text-foreground">
                  Teacher
                </span>
              </div>

              {formattedCreatedAt && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card/60 border border-border/70 sm:col-span-2">
                  <span className="text-muted-foreground">Provisioned Date</span>
                  <span className="font-medium text-foreground">
                    {formattedCreatedAt}
                  </span>
                </div>
              )}
            </div>
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
