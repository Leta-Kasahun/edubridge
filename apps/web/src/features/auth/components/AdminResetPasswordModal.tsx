"use client";

import { useState } from "react";
import {
  X,
  KeyRound,
  Eye,
  EyeOff,
  Check,
  Lock,
  Copy,
  CheckCheck,
  RotateCcw,
  User,
  AlertCircle,
} from "lucide-react";
import { useAdminResetPassword } from "../hooks/useAdminResetPassword";
import { AdminResetPasswordResult } from "../types";
import { getErrorMessage } from "@/shared/utils";

export interface AdminResetPasswordModalProps {
  readonly userId: string;
  readonly targetName: string;
  readonly targetIdentifier: string;
  readonly roleLabel: "Teacher" | "Student";
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSuccess?: () => void;
}

export function AdminResetPasswordModal({
  userId,
  targetName,
  targetIdentifier,
  roleLabel,
  isOpen,
  onClose,
  onSuccess,
}: AdminResetPasswordModalProps) {
  const [showResultPassword, setShowResultPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetResult, setResetResult] = useState<AdminResetPasswordResult | null>(null);
  const [copiedField, setCopiedField] = useState<"username" | "password" | "all" | null>(null);

  const resetMutation = useAdminResetPassword();

  if (!isOpen) return null;

  const handleClose = () => {
    setErrorMessage(null);
    setResetResult(null);
    setShowResultPassword(false);
    setCopiedField(null);
    onClose();
  };

  const handleCopy = async (text: string, field: "username" | "password" | "all") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      setErrorMessage("Failed to copy to clipboard");
    }
  };

  const handleReset = async () => {
    setErrorMessage(null);
    try {
      const result = await resetMutation.mutateAsync({
        userId,
        autoGenerate: true,
      });
      setResetResult(result);
      onSuccess?.();
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  const displayUsername = resetResult?.username || targetIdentifier;
  const displayPassword = resetResult?.tempPassword || "";

  const copyAllText = [
    `EduBridge Credentials`,
    `Name: ${targetName} (${roleLabel})`,
    `Username: ${displayUsername}`,
    `Password: ${displayPassword}`,
  ].join("\n");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
              <KeyRound size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
                Reset Password
              </h2>
              <p className="text-xs text-muted-foreground truncate">
                {roleLabel}: {targetName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {resetResult ? (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
              <div className="p-1 rounded-lg bg-emerald-500/20 shrink-0">
                <Check size={16} />
              </div>
              <p className="text-xs sm:text-sm font-semibold truncate">
                Password Reset Successfully
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <User size={11} />
                    <span>Username</span>
                  </span>
                  <p className="text-xs sm:text-sm font-mono font-medium text-foreground mt-0.5 truncate">
                    {displayUsername}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(displayUsername, "username")}
                  className="h-7 px-2.5 rounded-lg border border-border bg-background hover:bg-muted text-[11px] font-medium text-foreground flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                >
                  {copiedField === "username" ? (
                    <>
                      <CheckCheck size={12} className="text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="h-px bg-border/60" />

              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Lock size={11} />
                    <span>New Password</span>
                  </span>
                  <p className="text-xs sm:text-sm font-mono font-bold text-foreground mt-0.5 truncate">
                    {showResultPassword ? displayPassword : "••••••••••••"}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowResultPassword((prev) => !prev)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background transition-colors cursor-pointer"
                    aria-label={showResultPassword ? "Hide password" : "Show password"}
                  >
                    {showResultPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(displayPassword, "password")}
                    className="h-7 px-2.5 rounded-lg border border-border bg-background hover:bg-muted text-[11px] font-medium text-foreground flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedField === "password" ? (
                      <>
                        <CheckCheck size={12} className="text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => handleCopy(copyAllText, "all")}
                className="h-9 px-3 rounded-xl border border-border bg-background text-xs font-semibold text-foreground hover:bg-muted transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedField === "all" ? (
                  <>
                    <CheckCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Credentials</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-6 space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="p-3.5 rounded-xl border border-border bg-muted/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Account</span>
                <span className="font-semibold text-foreground">{targetName}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Username / ID</span>
                <span className="font-mono text-foreground">{targetIdentifier}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              A new password will be generated for this user. You can copy the credentials once completed.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <button
                type="button"
                onClick={handleClose}
                disabled={resetMutation.isPending}
                className="h-9 px-4 rounded-xl border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={resetMutation.isPending}
                className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {resetMutation.isPending ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw size={14} />
                    <span>Reset Password</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
