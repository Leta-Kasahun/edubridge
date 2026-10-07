"use client";

import { useState, useMemo } from "react";
import { Bookmark } from "lucide-react";
import { BookmarkTargetType } from "../types/bookmark.types";
import { useCheckBookmarks, useToggleBookmark } from "../hooks/useBookmarks";

interface BookmarkButtonProps {
  readonly targetType?: BookmarkTargetType;
  readonly targetId: string;
  readonly note?: string | null;
  readonly variant?: "icon" | "button";
  readonly className?: string;
  readonly isInitiallyBookmarked?: boolean;
}

export function BookmarkButton({
  targetType = "QUESTION",
  targetId,
  note,
  variant = "icon",
  className = "",
  isInitiallyBookmarked,
}: BookmarkButtonProps): React.JSX.Element {
  const targetIds = useMemo(() => (targetId ? [targetId] : []), [targetId]);
  const { data: checkData } = useCheckBookmarks(targetType, targetIds);
  const toggleMutation = useToggleBookmark();

  const isServerBookmarked = Boolean(
    isInitiallyBookmarked ?? (checkData?.bookmarkedIds?.includes(targetId) || false)
  );

  const [localOverrides, setLocalOverrides] = useState<Record<string, boolean>>({});

  const isBookmarked = targetId in localOverrides ? localOverrides[targetId] : isServerBookmarked;

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!targetId || toggleMutation.isPending) return;

    const nextState = !isBookmarked;
    setLocalOverrides((prev) => ({ ...prev, [targetId]: nextState }));

    try {
      const res = await toggleMutation.mutateAsync({
        targetType,
        targetId,
        note,
      });
      setLocalOverrides((prev) => ({ ...prev, [targetId]: res.bookmarked }));
    } catch {
      setLocalOverrides((prev) => ({ ...prev, [targetId]: isBookmarked }));
    }
  };

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={toggleMutation.isPending || !targetId}
        aria-label={isBookmarked ? "Remove from saved questions" : "Save question"}
        title={isBookmarked ? "Saved" : "Save Question"}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer select-none ${
          isBookmarked
            ? "bg-primary/10 border-primary/30 text-primary shadow-2xs"
            : "bg-muted/40 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
        } ${className}`}
      >
        <Bookmark
          size={14}
          className={`transition-transform duration-150 ${
            isBookmarked ? "fill-primary text-primary scale-110" : ""
          }`}
        />
        <span>{isBookmarked ? "Saved" : "Save"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={toggleMutation.isPending || !targetId}
      aria-label={isBookmarked ? "Remove from saved questions" : "Save question"}
      title={isBookmarked ? "Saved" : "Save Question"}
      className={`inline-flex items-center justify-center h-8 w-8 rounded-xl border transition-all cursor-pointer select-none ${
        isBookmarked
          ? "bg-primary/10 border-primary/30 text-primary shadow-2xs"
          : "bg-muted/40 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
      } ${className}`}
    >
      <Bookmark
        size={15}
        className={`transition-transform duration-150 ${
          isBookmarked ? "fill-primary text-primary scale-110" : ""
        }`}
      />
    </button>
  );
}
