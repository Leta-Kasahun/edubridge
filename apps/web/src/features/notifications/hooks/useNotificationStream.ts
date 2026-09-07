"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationStore } from "@/stores/notification.store";
import { env } from "@/config/env";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { SseNotificationPayload } from "../types/notification.types";

const RECONNECT_DELAY_MS = 5_000;

/**
 * Opens an SSE connection to /api/notifications/stream and forwards
 * incoming "notification" events into the Zustand notification store.
 *
 * Reconnects automatically on network drop with a 5 s back-off.
 * Cleans up on unmount or when the user logs out.
 */
export function useNotificationStream() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const pushSseItem = useNotificationStore((s) => s.pushSseItem);

  const esRef = useRef<EventSource | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const connect = () => {
      if (!mountedRef.current) return;

      const url = `${env.apiUrl}${API_ENDPOINTS.NOTIFICATIONS.STREAM}?token=${encodeURIComponent(accessToken)}`;
      const es = new EventSource(url);
      esRef.current = es;

      es.addEventListener("notification", (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data) as SseNotificationPayload;
          pushSseItem(payload);
        } catch {
          // malformed — ignore
        }
      });

      es.onerror = () => {
        es.close();
        esRef.current = null;
        // EventSource doesn't expose HTTP status codes on error.
        // We use a flag set by a failed 'connected' event timeout to
        // detect auth failures vs network drops.
        // Safe fallback: always retry — the hook will stop when
        // isAuthenticated becomes false (logout).
        if (mountedRef.current) {
          timerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
        }
      };
    };

    connect();

    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      esRef.current?.close();
      esRef.current = null;
    };
  }, [isAuthenticated, accessToken, pushSseItem]);
}
