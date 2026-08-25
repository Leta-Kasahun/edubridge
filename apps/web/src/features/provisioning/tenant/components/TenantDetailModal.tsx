"use client";

import {
  X,
  User,
  Mail,
  Users,
  GraduationCap,
  Shield,
  Clock,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TenantRecord } from "../types/tenant-provisioning.types";

export interface TenantDetailModalProps {
  readonly tenant: TenantRecord;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onRegenerateCredentials?: (tenant: TenantRecord) => void;
}

export function TenantDetailModal({
  tenant,
  isOpen,
  onClose,
  onRegenerateCredentials,
}: TenantDetailModalProps) {
  if (!isOpen) return null;

  const formattedCreatedAt = tenant.createdAt
    ? new Date(tenant.createdAt).toLocaleDateString()
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-card rounded-2xl border border-border shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground">
              {tenant.name}
            </h2>
            <div className="text-xs text-muted-foreground font-mono mt-0.5">
              Code: {tenant.code}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-background/50 border border-border">
            <div className="space-y-1">
              <div className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <Shield size={14} className="text-primary" />
                <span>School Status</span>
              </div>
              <div>
                <span
                  className={cn(
                    "inline-flex px-2 py-0.5 rounded text-[10px] font-semibold",
                    tenant.status === "ACTIVE"
                      ? "bg-primary/10 text-primary"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  {tenant.status}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <Clock size={14} className="text-primary" />
                <span>Created Date</span>
              </div>
              <div className="font-mono text-foreground font-medium truncate">
                {formattedCreatedAt || "—"}
              </div>
            </div>
          </div>

          <div className="space-y-3 p-4 rounded-xl bg-background/50 border border-border">
            <div className="font-semibold text-foreground flex items-center gap-1.5 pb-1 border-b border-border">
              <User size={14} className="text-primary" />
              <span>Primary School Administrator</span>
            </div>

            {tenant.admin ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Admin Name</span>
                  <span className="font-medium text-foreground">
                    {tenant.admin.firstName} {tenant.admin.lastName}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium text-foreground flex items-center gap-1">
                    <Mail size={12} className="text-muted-foreground" />
                    {tenant.admin.email || "No email provided"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Username</span>
                  <span className="font-mono font-medium text-foreground">
                    {tenant.admin.username}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground italic py-1">
                No administrator assigned to this school yet.
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-background/50 border border-border space-y-1">
              <div className="text-muted-foreground flex items-center gap-1.5">
                <GraduationCap size={14} className="text-primary" />
                <span>Teachers</span>
              </div>
              <div className="text-lg font-bold text-foreground">
                {tenant.totalTeachers}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-background/50 border border-border space-y-1">
              <div className="text-muted-foreground flex items-center gap-1.5">
                <Users size={14} className="text-primary" />
                <span>Students</span>
              </div>
              <div className="text-lg font-bold text-foreground">
                {tenant.totalStudents}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-3.5 border-t border-border bg-muted/20">
          <div>
            {tenant.admin && onRegenerateCredentials && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRegenerateCredentials(tenant);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
              >
                <KeyRound size={14} />
                <span>Reset Admin Access</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
