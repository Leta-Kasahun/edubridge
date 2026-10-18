"use client";

import { useState, useEffect, useCallback } from "react";
import { syncEngine } from "../sync/sync-engine";
import { OfflineSyncStatus } from "../types/offline.types";

export function useSyncStatus() {
  const [status, setStatus] = useState<OfflineSyncStatus>({
    isOnline: true,
    isSyncing: false,
    pendingCount: 0,
    failedCount: 0,
  });

  useEffect(() => {
    let mounted = true;

    setStatus((prev) => ({ ...prev, isOnline: navigator.onLine }));

    syncEngine.getStatus().then((initialStatus) => {
      if (mounted) {
        setStatus(initialStatus);
      }
    });

    const unsubscribe = syncEngine.subscribe((newStatus) => {
      if (mounted) {
        setStatus(newStatus);
      }
    });

    const handleOnline = () => {
      if (mounted) {
        setStatus((prev) => ({ ...prev, isOnline: true }));
      }
    };

    const handleOffline = () => {
      if (mounted) {
        setStatus((prev) => ({ ...prev, isOnline: false }));
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      mounted = false;
      unsubscribe();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const triggerSync = useCallback(async () => {
    return syncEngine.drain();
  }, []);

  return {
    ...status,
    triggerSync,
  };
}
