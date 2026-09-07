"use client";

import { useRouter } from "next/navigation";
import {
  Bell,
  BookOpen,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Shield,
  Settings,
  CheckCheck,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotificationList, useMarkRead, useMarkAllRead } from "../hooks/useNotifications";
import { NotificationItem, NotificationCategory } from "../types/notification.types";

interface NotificationDropdownProps {
  readonly onClose: () => void;
}

const CATEGORY_ICON: Record<NotificationCategory, React.ReactNode> = {
  ACADEMIC: <BookOpen size={14} />,
  ASSESSMENT: <ClipboardCheck size={14} />,
  CONTENT: <FileText size={14} />,
  TEACHER: <GraduationCap size={14} />,
  SECURITY: <Shield size={14} />,
  SYSTEM: <Settings size={14} />,
};

const PRIORITY_DOT: Record<string, string> = {
  LOW: "bg-muted-foreground/40",
  NORMAL: "bg-primary/60",
  HIGH: "bg-amber-500",
  URGENT: "bg-destructive",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function NotificationRow({
  item,
  onRead,
}: {
  item: NotificationItem;
  onRead: (id: string) => void;
}) {
  const router = useRouter();

  const handleClick = () => {
    if (!item.isRead) onRead(item.id);
    if (item.actionUrl) router.push(item.actionUrl);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "w-full text-left flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/60 cursor-pointer",
        !item.isRead && "bg-primary/5"
      )}
    >
      {/* Category icon */}
      <div
        className={cn(
          "mt-0.5 shrink-0 p-1.5 rounded-lg",
          item.isRead
            ? "bg-muted text-muted-foreground"
            : "bg-primary/10 text-primary"
        )}
      >
        {CATEGORY_ICON[item.category]}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "text-xs truncate",
              item.isRead ? "text-muted-foreground font-normal" : "text-foreground font-semibold"
            )}
          >
            {item.title}
          </p>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {timeAgo(item.createdAt)}
          </span>
        </div>

        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
          {item.body}
        </p>
      </div>

      {/* Unread dot */}
      {!item.isRead && (
        <span
          className={cn(
            "mt-1.5 shrink-0 h-2 w-2 rounded-full",
            PRIORITY_DOT[item.priority] ?? "bg-primary"
          )}
          aria-hidden="true"
        />
      )}
    </button>
  );
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { data, isLoading } = useNotificationList({ limit: 20 });
  const { mutate: markRead } = useMarkRead();
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllRead();

  const items = data?.items ?? [];
  const unreadCount = data?.meta.unreadCount ?? 0;

  const handleMarkAll = () => {
    markAllRead(undefined, { onSuccess: onClose });
  };

  return (
    <div
      className="absolute right-0 mt-2 w-[340px] origin-top-right rounded-xl bg-card border border-border shadow-lg ring-1 ring-foreground/5 z-50 animate-in fade-in-0 zoom-in-95 duration-100 overflow-hidden"
      role="dialog"
      aria-label="Notifications"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-primary" />
          <span className="text-sm font-semibold text-foreground">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAll}
            disabled={isMarkingAll}
            className="flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isMarkingAll ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <CheckCheck size={12} />
            )}
            Mark all read
          </button>
        )}
      </div>

      {/* Body */}
      <div className="max-h-[400px] overflow-y-auto divide-y divide-border/60">
        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
            <Bell size={24} className="opacity-30" />
            <p className="text-xs">No notifications yet</p>
          </div>
        )}

        {!isLoading &&
          items.map((item) => (
            <NotificationRow
              key={item.id}
              item={item}
              onRead={(id) => markRead([id])}
            />
          ))}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div className="border-t border-border px-4 py-2.5 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}
