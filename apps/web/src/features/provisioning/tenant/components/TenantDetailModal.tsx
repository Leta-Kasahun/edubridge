"use client";

import {
  X,
  Building2,
  User,
  Mail,
  KeyRound,
  Shield,
  CheckCircle,
  Clock,
  Calendar,
  Users,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TenantRecord } from "../types/tenant-provisioning.types";

export interface TenantDetailModalProps {
  readonly tenant: TenantRecord;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function TenantDetailModal({
  tenant,
  isOpen,
  onClose,
}: TenantDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-card rounded-2xl border border-border shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {tenant.name}
              </h2>
              <div className="text-xs text-muted-foreground font-mono">
                Code: {tenant.code}
              </div>
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
                <Calendar size={14} className="text-primary" />
                <span>Provisioned Date</span>
              </div>
              <div className="font-medium text-foreground">
                {new Date(tenant.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-background/50 border border-border flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Users size={16} />
              </div>
              <div>
                <div className="text-[11px] text-muted-foreground">Teachers</div>
                <div className="text-sm font-bold text-foreground">
                  {tenant.totalTeachers}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-background/50 border border-border flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <GraduationCap size={16} />
              </div>
              <div>
                <div className="text-[11px] text-muted-foreground">Students</div>
                <div className="text-sm font-bold text-foreground">
                  {tenant.totalStudents}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 p-3.5 rounded-xl bg-background/50 border border-border">
            <div className="text-xs font-semibold text-foreground flex items-center gap-1.5 pb-1 border-b border-border">
              <User size={14} className="text-primary" />
              <span>School Administrator</span>
            </div>

            {tenant.admin ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Full Name</span>
                  <span className="font-medium text-foreground">
                    {tenant.admin.firstName} {tenant.admin.lastName}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <KeyRound size={13} />
                    <span>Username</span>
                  </span>
                  <span className="font-mono font-medium text-foreground">
                    {tenant.admin.username}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Mail size={13} />
                    <span>Email</span>
                  </span>
                  <span className="font-medium text-foreground">
                    {tenant.admin.email || "No email registered"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Account Status</span>
                  <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary">
                    {tenant.admin.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    {tenant.admin.emailVerified ? (
                      <CheckCircle size={13} className="text-primary" />
                    ) : (
                      <Clock size={13} className="text-amber-500" />
                    )}
                    <span>Verification</span>
                  </span>
                  <span className="font-medium text-foreground">
                    {tenant.admin.emailVerified ? "Verified" : "Pending Setup"}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-muted-foreground text-xs italic py-2">
                No administrator assigned
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-border bg-muted/20">
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
