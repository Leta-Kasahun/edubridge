"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  MoreVertical,
  Eye,
  Edit2,
  GitBranch,
  Send,
  Check,
  Archive,
  Trash2,
  Plus,
} from "lucide-react";
import { LearningContentListItem } from "../../types/content.types";
import { ContentTypeBadge } from "./ContentTypeBadge";
import { ContentStatusBadge } from "./ContentStatusBadge";

interface ContentTableProps {
  readonly items: readonly LearningContentListItem[];
  readonly onViewDetail: (item: LearningContentListItem) => void;
  readonly onEdit: (item: LearningContentListItem) => void;
  readonly onSaveNewVersion: (item: LearningContentListItem) => void;
  readonly onSubmitForReview: (item: LearningContentListItem) => void;
  readonly onPublish: (item: LearningContentListItem) => void;
  readonly onArchive: (item: LearningContentListItem) => void;
  readonly onDelete: (item: LearningContentListItem) => void;
  readonly onOpenAddModal: () => void;
}

function ContentRowActions({
  item,
  onViewDetail,
  onEdit,
  onSaveNewVersion,
  onSubmitForReview,
  onPublish,
  onArchive,
  onDelete,
}: {
  readonly item: LearningContentListItem;
  readonly onViewDetail: (item: LearningContentListItem) => void;
  readonly onEdit: (item: LearningContentListItem) => void;
  readonly onSaveNewVersion: (item: LearningContentListItem) => void;
  readonly onSubmitForReview: (item: LearningContentListItem) => void;
  readonly onPublish: (item: LearningContentListItem) => void;
  readonly onArchive: (item: LearningContentListItem) => void;
  readonly onDelete: (item: LearningContentListItem) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuHeight = 220;
      const menuWidth = 170;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpwards = spaceBelow < menuHeight && rect.top > menuHeight;

      const top = openUpwards
        ? rect.top - menuHeight - 4
        : rect.bottom + 4;
      const left = Math.max(8, rect.right - menuWidth);

      setCoords({ top, left });
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      window.addEventListener("scroll", handleScrollOrResize, true);
      window.addEventListener("resize", handleScrollOrResize);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
        aria-label="Content actions"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen &&
        coords &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
            }}
            className="z-50 w-44 bg-card rounded-xl border border-border shadow-xl p-1 animate-in fade-in zoom-in-95 duration-100 flex flex-col text-xs"
          >
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onViewDetail(item);
              }}
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-foreground hover:bg-muted transition-colors cursor-pointer w-full text-left"
            >
              <Eye size={14} className="text-muted-foreground" />
              <span>View Details</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onEdit(item);
              }}
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-foreground hover:bg-muted transition-colors cursor-pointer w-full text-left"
            >
              <Edit2 size={14} className="text-muted-foreground" />
              <span>Edit Metadata</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onSaveNewVersion(item);
              }}
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-foreground hover:bg-muted transition-colors cursor-pointer w-full text-left"
            >
              <GitBranch size={14} className="text-muted-foreground" />
              <span>Save New Version</span>
            </button>

            {item.status === "DRAFT" && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onSubmitForReview(item);
                }}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-muted transition-colors cursor-pointer w-full text-left"
              >
                <Send size={14} />
                <span>Submit for Review</span>
              </button>
            )}

            {item.status !== "PUBLISHED" && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onPublish(item);
                }}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-muted transition-colors cursor-pointer w-full text-left font-medium"
              >
                <Check size={14} />
                <span>Publish</span>
              </button>
            )}

            {item.status === "PUBLISHED" && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onArchive(item);
                }}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors cursor-pointer w-full text-left"
              >
                <Archive size={14} />
                <span>Archive</span>
              </button>
            )}

            <div className="h-px bg-border my-1" />

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onDelete(item);
              }}
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors cursor-pointer w-full text-left"
            >
              <Trash2 size={14} />
              <span>Delete Material</span>
            </button>
          </div>,
          document.body
        )}
    </>
  );
}

export function ContentTable({
  items,
  onViewDetail,
  onEdit,
  onSaveNewVersion,
  onSubmitForReview,
  onPublish,
  onArchive,
  onDelete,
  onOpenAddModal,
}: ContentTableProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-card rounded-2xl border border-border">
        <h3 className="text-sm font-bold text-foreground mb-1">
          No Learning Materials Found
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mb-4">
          No materials match the selected filters. Add a new learning material or adjust your search filters.
        </p>
        <button
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs"
        >
          <Plus size={13} />
          <span>New Material</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-card rounded-xl border border-border p-4 shadow-2xs hover:border-primary/40 transition-colors flex flex-col justify-between gap-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                  <ContentTypeBadge type={item.type} />
                  <ContentStatusBadge status={item.status} />
                  <span className="font-mono text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted text-foreground border border-border">
                    v{item.currentVersion}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-foreground truncate">
                  {item.title}
                </h4>
                {item.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {item.description}
                  </p>
                )}
              </div>
              <ContentRowActions
                item={item}
                onViewDetail={onViewDetail}
                onEdit={onEdit}
                onSaveNewVersion={onSaveNewVersion}
                onSubmitForReview={onSubmitForReview}
                onPublish={onPublish}
                onArchive={onArchive}
                onDelete={onDelete}
              />
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {item.primaryTopic
                  ? `${item.primaryTopic.topicCode}: ${item.primaryTopic.topicTitle}`
                  : "Curriculum aligned"}
              </span>
              <span>{item.attachmentCount} files</span>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block bg-card rounded-2xl border border-border shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Curriculum Topic</th>
                <th className="py-3 px-4">Version</th>
                <th className="py-3 px-4">Attachments</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-muted/30 transition-colors group"
                >
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-semibold text-foreground text-xs truncate">
                      {item.title}
                    </div>
                    {item.description && (
                      <div className="text-[11px] text-muted-foreground line-clamp-1">
                        {item.description}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <ContentTypeBadge type={item.type} />
                  </td>
                  <td className="py-3.5 px-4 text-foreground text-xs">
                    {item.primaryTopic ? (
                      <div>
                        <span className="font-mono font-medium text-[11px] text-primary block">
                          {item.primaryTopic.topicCode}
                        </span>
                        <span className="text-muted-foreground line-clamp-1">
                          {item.primaryTopic.topicTitle}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-foreground text-xs">
                    v{item.currentVersion}
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground text-xs">
                    {item.attachmentCount}
                  </td>
                  <td className="py-3.5 px-4">
                    <ContentStatusBadge status={item.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <ContentRowActions
                      item={item}
                      onViewDetail={onViewDetail}
                      onEdit={onEdit}
                      onSaveNewVersion={onSaveNewVersion}
                      onSubmitForReview={onSubmitForReview}
                      onPublish={onPublish}
                      onArchive={onArchive}
                      onDelete={onDelete}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
