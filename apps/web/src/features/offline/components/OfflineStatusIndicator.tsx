"use client";

import { useSyncStatus } from "../hooks/useSyncStatus";
import { WifiOff, RefreshCw, AlertCircle } from "lucide-react";

interface OfflineStatusIconProps {
  readonly className?: string;
}

export function OfflineStatusIcon({ className }: OfflineStatusIconProps) {
  const { isOnline, isSyncing, failedCount, triggerSync } = useSyncStatus();

  if (isOnline && !isSyncing && failedCount === 0) {
    return null;
  }

  if (!isOnline) {
    return (
      <span
        title="Working offline"
        className={`inline-flex items-center justify-center text-amber-500 ${className ?? ""}`}
        aria-label="Working offline"
      >
        <WifiOff size={16} />
      </span>
    );
  }

  if (isSyncing) {
    return (
      <span
        title="Syncing changes"
        className={`inline-flex items-center justify-center text-muted-foreground ${className ?? ""}`}
        aria-label="Syncing changes"
      >
        <RefreshCw size={16} />
      </span>
    );
  }

  if (failedCount > 0) {
    return (
      <button
        type="button"
        onClick={triggerSync}
        title="Sync issue - click to retry"
        className={`inline-flex items-center justify-center text-destructive cursor-pointer hover:opacity-80 ${className ?? ""}`}
        aria-label="Sync issue - click to retry"
      >
        <AlertCircle size={16} />
      </button>
    );
  }

  return null;
}

export const OfflineStatusIndicator = OfflineStatusIcon;
