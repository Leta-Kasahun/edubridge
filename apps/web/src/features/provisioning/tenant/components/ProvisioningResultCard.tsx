"use client";

import { useState } from "react";
import { Check, Copy, RefreshCw, KeyRound, Mail, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/shared/components/SubmitButton";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import { useRegenerateCredentials } from "../hooks/useTenantProvisioning";
import { ProvisionSchoolAdminResult } from "../types/tenant-provisioning.types";

export interface ProvisioningResultCardProps {
  readonly result: ProvisionSchoolAdminResult;
  readonly onReset: () => void;
}

export function ProvisioningResultCard({
  result,
  onReset,
}: ProvisioningResultCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [currentCredentials, setCurrentCredentials] = useState(result.credentials);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);

  const regenerateMutation = useRegenerateCredentials();

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      setCopiedField(null);
    }
  };

  const handleRegenerate = async () => {
    setRegenerateError(null);
    try {
      const response = await regenerateMutation.mutateAsync({
        userId: result.user.id,
      });
      setCurrentCredentials({
        username: response.username,
        tempPassword: response.tempPassword,
      });
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
      const message =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error?.message ||
        (axiosError.message && !axiosError.message.includes("status code")
          ? axiosError.message
          : "Failed to regenerate credentials. Please try again.");
      setRegenerateError(message);
    }
  };

  const isInvitation = result.method === "INVITATION";

  return (
    <div className="w-full max-w-2xl mx-auto bg-card rounded-2xl border border-border p-5 sm:p-7 shadow-xs space-y-6">
      <div className="flex items-center gap-3.5 pb-4 border-b border-border">
        <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          {isInvitation ? <Mail size={22} /> : <ShieldCheck size={22} />}
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-foreground">
            {isInvitation ? "Invitation Sent" : "School Administrator Created"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {result.user.tenantName}
          </p>
        </div>
      </div>

      {regenerateError && <ErrorAlert message={regenerateError} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-muted/40 p-4 rounded-xl border border-border">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            School Name
          </span>
          <p className="text-sm font-medium text-foreground mt-0.5">
            {result.user.tenantName}
          </p>
        </div>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Administrator
          </span>
          <p className="text-sm font-medium text-foreground mt-0.5">
            {result.user.firstName} {result.user.lastName}
          </p>
        </div>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Assigned Username
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-sm font-bold text-foreground">
              {result.user.username}
            </span>
            <button
              type="button"
              onClick={() => handleCopy(result.user.username, "username")}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Copy username"
            >
              {copiedField === "username" ? (
                <Check size={14} className="text-primary" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>
        </div>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Account Status
          </span>
          <div className="mt-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-foreground border border-border">
              Pending First Login
            </span>
          </div>
        </div>
      </div>

      {!isInvitation && currentCredentials && (
        <div className="space-y-3 p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2">
            <KeyRound size={16} className="text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Temporary Access Credentials
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/60 border border-border">
              <div>
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                  Username
                </span>
                <p className="font-mono text-sm font-bold text-foreground">
                  {currentCredentials.username}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleCopy(currentCredentials.username, "user_direct")}
                className="h-8 gap-1.5 text-xs"
              >
                {copiedField === "user_direct" ? (
                  <>
                    <Check size={13} className="text-primary" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/60 border border-border">
              <div>
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                  Temporary Password
                </span>
                <p className="font-mono text-sm font-bold text-foreground">
                  {currentCredentials.tempPassword}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleCopy(currentCredentials.tempPassword, "pass_direct")}
                className="h-8 gap-1.5 text-xs"
              >
                {copiedField === "pass_direct" ? (
                  <>
                    <Check size={13} className="text-primary" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRegenerate}
              disabled={regenerateMutation.isPending}
              className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
            >
              <RefreshCw
                size={13}
                className={regenerateMutation.isPending ? "animate-spin" : ""}
              />
              <span>Regenerate Credentials</span>
            </Button>
          </div>
        </div>
      )}

      {isInvitation && result.invitation && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
          <CheckCircle2 size={18} className="text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-foreground">
              Email invitation dispatched
            </p>
            <p className="text-xs text-muted-foreground">
              Delivered to {result.invitation.email} with temporary credentials and a single-use 48-hour access code.
            </p>
          </div>
        </div>
      )}

      <div className="pt-2 flex flex-col sm:flex-row gap-3">
        <SubmitButton
          type="button"
          onClick={onReset}
          className="w-full"
        >
          Add Another School
        </SubmitButton>
      </div>
    </div>
  );
}
