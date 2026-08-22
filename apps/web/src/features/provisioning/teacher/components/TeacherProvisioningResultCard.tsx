"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Copy,
  Check,
  Send,
  KeyRound,
  User,
  Mail,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Users,
  AlertTriangle,
} from "lucide-react";
import { SubmitButton } from "@/shared/components/SubmitButton";
import {
  TeacherProvisionResult,
  TeacherBulkProvisionResult,
} from "../types/teacher-provisioning.types";

export interface TeacherProvisioningResultCardProps {
  readonly result?: TeacherProvisionResult | null;
  readonly bulkResult?: TeacherBulkProvisionResult | null;
  readonly onReset: () => void;
}

export function TeacherProvisioningResultCard({
  result,
  bulkResult,
  onReset,
}: TeacherProvisioningResultCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, fieldKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      setCopiedField(null);
    }
  };

  if (bulkResult) {
    const isFullSuccess = bulkResult.failureCount === 0;

    return (
      <div className="w-full max-w-2xl mx-auto bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-xs space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary mb-1">
            <Users size={32} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Bulk Onboarding {isFullSuccess ? "Completed" : "Summary"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {bulkResult.message}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-background/50 border border-border text-center">
          <div>
            <div className="text-xs font-semibold uppercase text-muted-foreground">Total</div>
            <div className="text-lg font-bold text-foreground">{bulkResult.totalRows}</div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400">Success</div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{bulkResult.successCount}</div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-rose-600 dark:text-rose-400">Failed</div>
            <div className="text-lg font-bold text-rose-600 dark:text-rose-400">{bulkResult.failureCount}</div>
          </div>
        </div>

        {bulkResult.failedRows.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-rose-600 dark:text-rose-400 tracking-wider">
              <AlertTriangle size={16} />
              <span>Rows with Errors ({bulkResult.failedRows.length})</span>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-2 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-xs">
              {bulkResult.failedRows.map((failed) => (
                <div key={failed.rowNumber} className="border-b border-rose-500/10 pb-2 last:border-b-0 last:pb-0">
                  <div className="font-semibold text-rose-600 dark:text-rose-400">
                    Row {failed.rowNumber}:
                  </div>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {failed.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2">
          <SubmitButton
            type="button"
            onClick={onReset}
            icon={<ArrowRight size={18} />}
            iconPosition="right"
            className="w-full"
          >
            Onboard More Teachers
          </SubmitButton>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const isInvite = result.method === "INVITATION";

  return (
    <div className="w-full max-w-2xl mx-auto bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-xs space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary mb-1">
          {isInvite ? <Send size={32} /> : <CheckCircle2 size={32} />}
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          {isInvite ? "Teacher Invitation Sent" : "Teacher Account Ready"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {result.message}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-background/50 divide-y divide-border overflow-hidden">
        <div className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <User size={18} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Teacher Name</div>
              <div className="text-sm font-semibold text-foreground">
                {result.teacher.firstName} {result.teacher.middleName} {result.teacher.lastName}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Employee Code</div>
            <div className="text-xs font-mono font-medium text-foreground">
              {result.teacher.employeeCode}
            </div>
          </div>
        </div>

        <div className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <KeyRound size={18} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Assigned Username</div>
              <div className="text-sm font-mono font-semibold text-foreground">
                {result.teacher.username}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(result.teacher.username, "username")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
          >
            {copiedField === "username" ? (
              <>
                <Check size={14} className="text-primary" />
                <span className="text-primary font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {isInvite && result.invitation?.email && (
          <div className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Mail size={18} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Destination Email</div>
                <div className="text-sm font-semibold text-foreground">
                  {result.invitation.email}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Verification OTP</div>
              <div className="text-xs font-mono font-bold text-primary">
                {result.invitation.otpCode || "Delivered to Email"}
              </div>
            </div>
          </div>
        )}

        {!isInvite && result.credentials?.tempPassword && (
          <div className="p-4 flex items-center justify-between gap-4 bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Sparkles size={18} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Temporary Password</div>
                <div className="text-sm font-mono font-bold text-foreground">
                  {result.credentials.tempPassword}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(result.credentials!.tempPassword, "password")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
            >
              {copiedField === "password" ? (
                <>
                  <Check size={14} className="text-primary" />
                  <span className="text-primary font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {!isInvite && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200">
          <ShieldAlert size={20} className="shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            Please share these credentials securely with the teacher. They will be prompted to choose a new permanent password on their first login.
          </div>
        </div>
      )}

      <div className="pt-2">
        <SubmitButton
          type="button"
          onClick={onReset}
          icon={<ArrowRight size={18} />}
          iconPosition="right"
          className="w-full"
        >
          Add Another Teacher
        </SubmitButton>
      </div>
    </div>
  );
}
