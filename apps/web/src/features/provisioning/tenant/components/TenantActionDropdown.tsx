"use client";

import { useState, useRef } from "react";
import { MoreVertical, Eye, Power, PowerOff, KeyRound } from "lucide-react";
import { useClickOutside } from "@/shared/hooks/useClickOutside";
import { TenantRecord } from "../types/tenant-provisioning.types";

export interface TenantActionDropdownProps {
  readonly tenant: TenantRecord;
  readonly onView: (tenant: TenantRecord) => void;
  readonly onToggleStatus: (tenant: TenantRecord) => void;
  readonly onRegenerateCredentials?: (tenant: TenantRecord) => void;
}

export function TenantActionDropdown({
  tenant,
  onView,
  onToggleStatus,
  onRegenerateCredentials,
}: TenantActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => {
    if (isOpen) {
      setIsOpen(false);
    }
  });

  const canRegenerate =
    tenant.admin &&
    tenant.admin.status === "PENDING_FIRST_LOGIN" &&
    Boolean(onRegenerateCredentials);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-hidden cursor-pointer"
        aria-label="Actions"
        aria-expanded={isOpen}
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-9 w-40 bg-card border border-border rounded-xl shadow-lg p-1 z-30 animate-in fade-in-0 zoom-in-95">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onView(tenant);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left"
          >
            <Eye size={13} className="text-primary" />
            <span>Details</span>
          </button>

          {canRegenerate && onRegenerateCredentials && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onRegenerateCredentials(tenant);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left"
            >
              <KeyRound size={13} className="text-amber-500" />
              <span>Regenerate</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onToggleStatus(tenant);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left"
          >
            {tenant.status === "ACTIVE" ? (
              <>
                <PowerOff size={13} className="text-destructive" />
                <span className="text-destructive font-medium">Deactivate</span>
              </>
            ) : (
              <>
                <Power size={13} className="text-primary" />
                <span className="text-primary font-medium">Activate</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
