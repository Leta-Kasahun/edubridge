"use client";

import { X, User, Mail, Phone, BadgeCheck, KeyRound, Shield, CheckCircle, Clock } from "lucide-react";
import { TeacherRecord } from "../types/teacher-provisioning.types";

export interface TeacherDetailModalProps {
  readonly teacher: TeacherRecord;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onEdit?: () => void;
}

export function TeacherDetailModal({
  teacher,
  isOpen,
  onClose,
  onEdit,
}: TeacherDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-card rounded-2xl border border-border shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              {teacher.firstName.charAt(0)}{teacher.lastName.charAt(0)}
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {teacher.firstName} {teacher.middleName} {teacher.lastName}
              </h2>
              <div className="text-xs text-muted-foreground font-mono">
                {teacher.employeeCode}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-background/50 border border-border">
            <div className="space-y-1">
              <div className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <KeyRound size={14} className="text-primary" />
                <span>Assigned Username</span>
              </div>
              <div className="font-mono font-semibold text-foreground">
                {teacher.username}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <BadgeCheck size={14} className="text-primary" />
                <span>Employee Code</span>
              </div>
              <div className="font-mono font-semibold text-foreground">
                {teacher.employeeCode}
              </div>
            </div>
          </div>

          <div className="space-y-2.5 p-3.5 rounded-xl bg-background/50 border border-border">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Mail size={14} />
                <span>Email Address</span>
              </span>
              <span className="font-medium text-foreground">
                {teacher.email || "Not registered"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Phone size={14} />
                <span>Phone Number</span>
              </span>
              <span className="font-medium text-foreground">
                {teacher.phoneNumber || "Not registered"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <User size={14} />
                <span>Gender</span>
              </span>
              <span className="font-medium text-foreground uppercase">
                {teacher.gender}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Shield size={14} />
                <span>Account Status</span>
              </span>
              <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary">
                {teacher.status}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                {teacher.emailVerified ? (
                  <CheckCircle size={14} className="text-emerald-500" />
                ) : (
                  <Clock size={14} className="text-amber-500" />
                )}
                <span>Email Verification</span>
              </span>
              <span className="font-medium text-foreground">
                {teacher.emailVerified ? "Verified" : "Pending Setup"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-border bg-muted/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
          >
            Close
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit();
              }}
              className="px-4 py-2 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/15 rounded-lg transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
