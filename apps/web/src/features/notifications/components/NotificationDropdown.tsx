"use client";

import { useEffect, useRef } from "react";
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
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useInfiniteNotificationList,
  useMarkRead,
  useMarkAllRead,
} from "../hooks/useNotifications";
import {
  NotificationItem,
  NotificationCategory,
} from "../types/notification.types";

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
  onClose,
}: {
  item: NotificationItem;
  onRead: (id: string) => void;
  onClose?: () => void;
}) {
  const router = useRouter();

  const handleClick = () => {
    if (!item.isRead) onRead(item.id);
    if (item.actionUrl) {
      router.push(item.actionUrl);
      onClose?.();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "w-full text-left flex items-start gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 transition-colors hover:bg-muted/60 active:bg-muted/80 cursor-pointer",
        !item.isRead && "bg-primary/5"
      )}
    >
      <div
        className={cn(
          "mt-0.5 shrink-0 p-1.5 rounded-lg flex items-center justify-center",
          item.isRead
            ? "bg-muted text-muted-foreground"
            : "bg-primary/10 text-primary"
        )}
      >
        {CATEGORY_ICON[item.category] ?? <Bell size={14} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
          <p
            className={cn(
              "text-xs truncate",
              item.isRead
                ? "text-muted-foreground font-normal"
                : "text-foreground font-semibold"
            )}
          >
            {item.title}
          </p>
          <span className="shrink-0 text-[10px] text-muted-foreground whitespace-nowrap">
            {timeAgo(item.createdAt)}
          </span>
        </div>

        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 break-words">
          {item.body}
        </p>
      </div>

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
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteNotificationList({ limit: 15 });
  const { mutate: markRead } = useMarkRead();
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllRead();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  const items = Array.from(
    new Map(
      (data?.pages.flatMap((page) => page.items) ?? []).map((item) => [
        item.id,
        item,
      ])
    ).values()
  );
  const unreadCount = data?.pages[0]?.meta.unreadCount ?? 0;
  const total = data?.pages[0]?.meta.total ?? 0;

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const target = observerRef.current;
    const root = scrollContainerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchNextPage();
        }
      },
      {
        root,
        rootMargin: "100px",
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleMarkAll = () => {
    markAllRead(undefined, { onSuccess: onClose });
  };

  return (
    <div
      className="fixed inset-x-2.5 top-15 sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-[380px] max-w-[calc(100vw-1.25rem)] sm:max-w-md origin-top-right rounded-xl bg-card border border-border shadow-xl ring-1 ring-foreground/5 z-50 animate-in fade-in-0 zoom-in-95 duration-100 overflow-hidden flex flex-col"
      role="dialog"
      aria-label="Notifications"
    >
      <div className="flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Bell size={15} className="text-primary shrink-0" />
          <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
            Notifications
          </span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full shrink-0">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              disabled={isMarkingAll}
              className="flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isMarkingAll ? (
                <Loader2 size={12} className="animate-spin shrink-0" />
              ) : (
                <CheckCheck size={12} className="shrink-0" />
              )}
              <span>Mark all read</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="sm:hidden p-1 -mr-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Close notifications"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="max-h-[min(380px,calc(100dvh-11rem))] sm:max-h-[420px] overflow-y-auto divide-y divide-border/60 overscroll-contain"
      >
        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 px-4 gap-2 text-muted-foreground text-center">
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
              onClose={onClose}
            />
          ))}

        {!isLoading && hasNextPage && <div ref={observerRef} className="h-1" />}

        {isFetchingNextPage && (
          <div className="flex items-center justify-center py-3 text-muted-foreground bg-muted/10">
            <Loader2 size={16} className="animate-spin text-primary" />
          </div>
        )}
      </div>

      {!isLoading && items.length > 0 && (
        <div className="border-t border-border px-4 py-2.5 bg-muted/20 text-center shrink-0">
          {hasNextPage ? (
            <button
              type="button"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer py-0.5 disabled:opacity-50"
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 size={12} className="animate-spin shrink-0" />
                  <span>Loading more notifications...</span>
                </>
              ) : (
                <span>
                  Load more notifications ({items.length} of {total})
                </span>
              )}
            </button>
          ) : (
            <span className="text-[11px] text-muted-foreground">
              All {items.length} {items.length === 1 ? "notification" : "notifications"} loaded
            </span>
          )}
        </div>
      )}
    </div>
  );
}
