"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationStore } from "@/stores/notification.store";
import { env } from "@/config/env";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { SseNotificationPayload } from "../types/notification.types";

const RECONNECT_DELAY_MS = 5_000;

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
        } catch {}
      });

      es.onerror = () => {
        es.close();
        esRef.current = null;
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
