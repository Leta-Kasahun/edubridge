"use client";

import { useState } from "react";
import { X, Check, Copy, KeyRound } from "lucide-react";
import { TenantListTable } from "./TenantListTable";
import { TenantProvisioningForm } from "./TenantProvisioningForm";
import { ProvisioningResultCard } from "./ProvisioningResultCard";
import { TenantDetailModal } from "./TenantDetailModal";
import { useRegenerateCredentials } from "../hooks/useTenantProvisioning";
import {
  TenantRecord,
  ProvisionSchoolAdminResult,
  RegenerateCredentialsResult,
} from "../types/tenant-provisioning.types";

export function TenantProvisioningManager() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTenantForView, setSelectedTenantForView] = useState<TenantRecord | null>(null);
  const [provisionResult, setProvisionResult] = useState<ProvisionSchoolAdminResult | null>(null);
  const [regeneratedResult, setRegeneratedResult] = useState<RegenerateCredentialsResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  const handleSingleSuccess = (result: ProvisionSchoolAdminResult) => {
    setIsAddModalOpen(false);
    setProvisionResult(result);
  };

  const handleResetResults = () => {
    setProvisionResult(null);
  };

  const handleRegenerateCredentials = async (tenant: TenantRecord) => {
    if (!tenant.admin) return;
    try {
      const res = await regenerateMutation.mutateAsync({
        userId: tenant.admin.id,
      });
      setRegeneratedResult(res);
    } catch {
      setRegeneratedResult(null);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <TenantListTable
        onAddSchool={() => setIsAddModalOpen(true)}
        onViewTenant={(tenant) => setSelectedTenantForView(tenant)}
        onRegenerateCredentials={handleRegenerateCredentials}
      />

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-base font-bold text-foreground">Add New School / Tenant</h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <TenantProvisioningForm onSuccess={handleSingleSuccess} />
            </div>
          </div>
        </div>
      )}

      {provisionResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-base font-bold text-foreground">Provisioning Completed</h2>
              <button
                type="button"
                onClick={handleResetResults}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <ProvisioningResultCard
                result={provisionResult}
                onReset={handleResetResults}
              />
            </div>
          </div>
        </div>
      )}

      {regeneratedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <KeyRound size={18} className="text-primary" />
                <h2 className="text-base font-bold text-foreground">New Credentials</h2>
              </div>
              <button
                type="button"
                onClick={() => setRegeneratedResult(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/60 border border-border">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                      Username
                    </span>
                    <p className="font-mono text-sm font-bold text-foreground">
                      {regeneratedResult.username}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(regeneratedResult.username, "regen_user")}
                    className="p-1.5 rounded-md border border-border bg-background hover:bg-muted text-foreground transition-colors cursor-pointer"
                  >
                    {copiedField === "regen_user" ? (
                      <Check size={14} className="text-primary" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/60 border border-border">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                      Temporary Password
                    </span>
                    <p className="font-mono text-sm font-bold text-foreground">
                      {regeneratedResult.tempPassword}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(regeneratedResult.tempPassword, "regen_pass")}
                    className="p-1.5 rounded-md border border-border bg-background hover:bg-muted text-foreground transition-colors cursor-pointer"
                  >
                    {copiedField === "regen_pass" ? (
                      <Check size={14} className="text-primary" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end px-5 py-3 border-t border-border bg-muted/20">
              <button
                type="button"
                onClick={() => setRegeneratedResult(null)}
                className="px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-lg cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedTenantForView && (
        <TenantDetailModal
          tenant={selectedTenantForView}
          isOpen={Boolean(selectedTenantForView)}
          onClose={() => setSelectedTenantForView(null)}
          onRegenerateCredentials={handleRegenerateCredentials}
        />
      )}
    </div>
  );
}
