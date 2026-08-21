"use client";

import { useState, useEffect } from "react";
import {
  KeyRound,
  ShieldCheck,
  Smartphone,
  Clock,
  AlertTriangle,
  Save,
  Check,
} from "lucide-react";
import { useSecurityPolicy, useUpdateSecurityPolicy } from "../hooks/useSecurityPolicy";
import { SecurityPolicy } from "../types/security.types";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { cn } from "@/lib/utils";

const FALLBACK_POLICY: SecurityPolicy = {
  minPasswordLength: 12,
  maxPasswordLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  passwordExpiryDays: 90,
  forcePasswordChangeAfterReset: true,

  maxFailedAttempts: 5,
  failedAttemptWindowMinutes: 15,
  lockoutDurationMinutes: 15,

  otpEnabled: true,
  otpExpiryMinutes: 5,
  otpMaxAttempts: 5,
  otpResendCooldownSeconds: 30,
  otpMaxResendPerHour: 5,
  requireOtpForLogin: false,
  requireOtpForEmailChange: true,
  requireOtpForVerification: true,

  accessTokenExpiryMinutes: 15,
  refreshTokenExpiryDays: 7,
  maxConcurrentSessions: 5,
  sessionTimeoutMinutes: 60,
  revokeSessionsOnPasswordChange: true,

  detectSuspiciousLogin: true,
  notifyOnNewDevice: true,
  allowGoogleAuth: true,
};

interface ToggleRowProps {
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: (val: boolean) => void;
}

function ToggleRow({ label, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-xs font-medium text-foreground">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
          checked ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}

interface NumberRowProps {
  readonly label: string;
  readonly value: number;
  readonly min?: number;
  readonly max?: number;
  readonly unit?: string;
  readonly onChange: (val: number) => void;
}

function NumberRow({ label, value, min = 0, max = 1000, unit, onChange }: NumberRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-xs font-medium text-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-16 h-7 px-2 text-center text-xs font-mono font-bold bg-muted/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:border-primary"
        />
        {unit && <span className="text-[11px] text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}

export function SecurityPolicyManager() {
  const { data: apiPolicy, isLoading } = useSecurityPolicy();
  const updateMutation = useUpdateSecurityPolicy();

  const [policy, setPolicy] = useState<SecurityPolicy>(apiPolicy || FALLBACK_POLICY);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (apiPolicy) {
      setPolicy(apiPolicy);
    }
  }, [apiPolicy]);

  const updateField = <K extends keyof SecurityPolicy>(key: K, value: SecurityPolicy[K]) => {
    setPolicy((prev) => ({
      ...prev,
      [key]: value,
    }));
    setSavedSuccess(false);
  };

  const handleSave = () => {
    const { id, tenantId, ...cleanPayload } = policy;
    updateMutation.mutate(cleanPayload, {
      onSuccess: () => {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      },
    });
  };

  if (isLoading && !apiPolicy) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-3 pb-1">
        <button
          type="button"
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer shrink-0"
        >
          {savedSuccess ? (
            <>
              <Check size={14} className="stroke-[3]" />
              <span>Saved</span>
            </>
          ) : updateMutation.isPending ? (
            <>
              <LoadingSpinner size={14} />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save size={14} />
              <span>Save Policy</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card rounded-xl border border-border p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <KeyRound size={16} />
            </div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Password Complexity
            </h3>
          </div>

          <div className="space-y-1">
            <NumberRow
              label="Minimum Length"
              value={policy.minPasswordLength}
              min={8}
              max={64}
              unit="chars"
              onChange={(val) => updateField("minPasswordLength", val)}
            />
            <NumberRow
              label="Maximum Length"
              value={policy.maxPasswordLength}
              min={16}
              max={256}
              unit="chars"
              onChange={(val) => updateField("maxPasswordLength", val)}
            />
            <NumberRow
              label="Password Expiry"
              value={policy.passwordExpiryDays}
              min={0}
              max={365}
              unit="days"
              onChange={(val) => updateField("passwordExpiryDays", val)}
            />
            <ToggleRow
              label="Require Uppercase Letters"
              checked={policy.requireUppercase}
              onChange={(val) => updateField("requireUppercase", val)}
            />
            <ToggleRow
              label="Require Numbers"
              checked={policy.requireNumbers}
              onChange={(val) => updateField("requireNumbers", val)}
            />
            <ToggleRow
              label="Require Special Characters"
              checked={policy.requireSpecialChars}
              onChange={(val) => updateField("requireSpecialChars", val)}
            />
            <ToggleRow
              label="Force Password Change After Reset"
              checked={policy.forcePasswordChangeAfterReset}
              onChange={(val) => updateField("forcePasswordChangeAfterReset", val)}
            />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Smartphone size={16} />
            </div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Authentication & Two-Factor (2FA)
            </h3>
          </div>

          <div className="space-y-1">
            <ToggleRow
              label="Enable OTP Multi-Factor Authentication"
              checked={policy.otpEnabled}
              onChange={(val) => updateField("otpEnabled", val)}
            />
            <ToggleRow
              label="Enforce 2FA on Every Login"
              checked={policy.requireOtpForLogin}
              onChange={(val) => updateField("requireOtpForLogin", val)}
            />
            <ToggleRow
              label="Require OTP for Email Changes"
              checked={policy.requireOtpForEmailChange}
              onChange={(val) => updateField("requireOtpForEmailChange", val)}
            />
            <ToggleRow
              label="Allow Google Single Sign-On"
              checked={policy.allowGoogleAuth}
              onChange={(val) => updateField("allowGoogleAuth", val)}
            />
            <NumberRow
              label="OTP Validity Duration"
              value={policy.otpExpiryMinutes}
              min={1}
              max={30}
              unit="min"
              onChange={(val) => updateField("otpExpiryMinutes", val)}
            />
            <NumberRow
              label="OTP Resend Cooldown"
              value={policy.otpResendCooldownSeconds}
              min={10}
              max={120}
              unit="sec"
              onChange={(val) => updateField("otpResendCooldownSeconds", val)}
            />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Clock size={16} />
            </div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Session & Inactivity Lifecycle
            </h3>
          </div>

          <div className="space-y-1">
            <NumberRow
              label="Session Inactivity Timeout"
              value={policy.sessionTimeoutMinutes}
              min={5}
              max={1440}
              unit="min"
              onChange={(val) => updateField("sessionTimeoutMinutes", val)}
            />
            <NumberRow
              label="Maximum Concurrent Active Sessions"
              value={policy.maxConcurrentSessions}
              min={1}
              max={20}
              unit="sessions"
              onChange={(val) => updateField("maxConcurrentSessions", val)}
            />
            <NumberRow
              label="Access Token Expiration"
              value={policy.accessTokenExpiryMinutes}
              min={5}
              max={120}
              unit="min"
              onChange={(val) => updateField("accessTokenExpiryMinutes", val)}
            />
            <ToggleRow
              label="Revoke Sessions on Password Reset"
              checked={policy.revokeSessionsOnPasswordChange}
              onChange={(val) => updateField("revokeSessionsOnPasswordChange", val)}
            />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Lockout & Threat Detection
            </h3>
          </div>

          <div className="space-y-1">
            <NumberRow
              label="Maximum Failed Login Attempts"
              value={policy.maxFailedAttempts}
              min={3}
              max={10}
              unit="attempts"
              onChange={(val) => updateField("maxFailedAttempts", val)}
            />
            <NumberRow
              label="Account Lockout Duration"
              value={policy.lockoutDurationMinutes}
              min={5}
              max={1440}
              unit="min"
              onChange={(val) => updateField("lockoutDurationMinutes", val)}
            />
            <ToggleRow
              label="Detect Suspicious Sign-in Activity"
              checked={policy.detectSuspiciousLogin}
              onChange={(val) => updateField("detectSuspiciousLogin", val)}
            />
            <ToggleRow
              label="Notify User on New Device Sign-in"
              checked={policy.notifyOnNewDevice}
              onChange={(val) => updateField("notifyOnNewDevice", val)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
