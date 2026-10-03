"use client";

import { useRef, useState } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClickOutside } from "@/shared/hooks";
import { useNotificationStore } from "@/stores/notification.store";
import { useUnreadCount } from "../hooks/useNotifications";
import { NotificationDropdown } from "./NotificationDropdown";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useUnreadCount();

  const unreadCount = useNotificationStore((s) => s.unreadCount);

  useClickOutside(ref, () => setOpen(false));

  const badgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={cn(
          "relative p-2 rounded-lg transition-colors focus:outline-none cursor-pointer",
          "text-muted-foreground hover:text-foreground hover:bg-muted",
          open && "bg-muted text-foreground"
        )}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span
            className="absolute top-1 right-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground ring-2 ring-card px-0.5"
            aria-hidden="true"
          >
            {badgeLabel}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-2xs sm:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <NotificationDropdown onClose={() => setOpen(false)} />
        </>
      )}
    </div>
  );
}
