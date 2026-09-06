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
  Paperclip,
  UploadCloud,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { LearningContentListItem } from "../../types/content.types";
import { ContentTypeBadge } from "./ContentTypeBadge";
import { ContentStatusBadge } from "./ContentStatusBadge";
import { ContentScopeBadge } from "./ContentScopeBadge";
import {
  getContentIcon,
  formatContentAlignment,
} from "../../utils/content-format.util";

interface ContentTableProps {
  readonly items: readonly LearningContentListItem[];
  readonly selectedIds?: ReadonlySet<string>;
  readonly onToggleSelect?: (id: string) => void;
  readonly onToggleSelectAll?: () => void;
  readonly onViewDetail: (item: LearningContentListItem) => void;
  readonly onEdit: (item: LearningContentListItem) => void;
  readonly onSaveNewVersion: (item: LearningContentListItem) => void;
  readonly onSubmitForReview: (item: LearningContentListItem) => void;
  readonly onApprove?: (item: LearningContentListItem) => void;
  readonly onPublish: (item: LearningContentListItem) => void;
  readonly onArchive: (item: LearningContentListItem) => void;
  readonly onActivate?: (item: LearningContentListItem) => void;
  readonly onDelete: (item: LearningContentListItem) => void;
  readonly onOpenUpload?: (item: LearningContentListItem) => void;
  readonly onOpenAddModal: () => void;
}

export interface ContentRowActionsProps {
  readonly item: LearningContentListItem;
  readonly onViewDetail: (item: LearningContentListItem) => void;
  readonly onEdit: (item: LearningContentListItem) => void;
  readonly onOpenUpload?: (item: LearningContentListItem) => void;
  readonly onSaveNewVersion: (item: LearningContentListItem) => void;
  readonly onSubmitForReview: (item: LearningContentListItem) => void;
  readonly onApprove?: (item: LearningContentListItem) => void;
  readonly onPublish: (item: LearningContentListItem) => void;
  readonly onArchive: (item: LearningContentListItem) => void;
  readonly onActivate?: (item: LearningContentListItem) => void;
  readonly onDelete: (item: LearningContentListItem) => void;
}

export function ContentRowActions({
  item,
  onViewDetail,
  onEdit,
  onOpenUpload,
  onSaveNewVersion,
  onSubmitForReview,
  onApprove,
  onPublish,
  onArchive,
  onActivate,
  onDelete,
}: ContentRowActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const user = useAuthStore((state) => state.user);
  const roles = user?.roles ?? [];
  const isAdmin =
    roles.includes("SCHOOL_ADMIN") ||
    roles.includes("SYSTEM_ADMIN") ||
    roles.includes("ADMIN");
  const isAuthor = user?.id ? item.authorId === user.id : false;

  const isTextbookOrRef = item.type === "TEXTBOOK" || item.type === "REFERENCE_BOOK";

  const canEdit = isAdmin || isAuthor;
  const canUpload =
    Boolean(onOpenUpload) && (isAdmin || isAuthor);
  const canNewVersion =
    isAdmin || (isAuthor && (item.status === "PUBLISHED" || item.status === "APPROVED"));
  const canSubmit = item.status === "DRAFT" && (isAuthor || isAdmin);
  const canApprove =
    Boolean(onApprove) && isAdmin && item.status === "PENDING_REVIEW";
  const canPublish =
    (isAdmin && (item.status === "APPROVED" || item.status === "PENDING_REVIEW" || (!isTextbookOrRef && item.status === "DRAFT"))) ||
    (isAuthor && !isTextbookOrRef && item.status === "DRAFT") ||
    (isAuthor && isTextbookOrRef && item.status === "APPROVED");
  const canArchive = (isAdmin || isAuthor) && item.status === "PUBLISHED";
  const canDelete = isAdmin || (isAuthor && (item.status === "DRAFT" || item.status === "ARCHIVED"));

  const canActivate =
    Boolean(onActivate) && (isAdmin || isAuthor) && item.status === "ARCHIVED";

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 160;
    const menuHeight = 240;

    let top = rect.bottom + 4;
    if (top + menuHeight > window.innerHeight) {
      top = Math.max(10, rect.top - menuHeight - 4);
    }

    let left = rect.right - menuWidth;
    if (left < 10) {
      left = 10;
    }

    setCoords({ top, left });
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const handleScroll = () => updatePosition();
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleScroll);
      return () => {
        window.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("resize", handleScroll);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
        aria-label="Actions"
      >
        <MoreVertical size={15} />
      </button>

      {isOpen &&
        coords &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 9999,
            }}
            className="w-40 bg-popover text-popover-foreground border border-border rounded-xl shadow-xl py-1.5 animate-in fade-in-0 zoom-in-95 text-xs"
          >
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onViewDetail(item);
              }}
              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-muted/80 transition-colors cursor-pointer text-foreground text-left"
            >
              <Eye size={13} className="text-muted-foreground" />
              <span>View</span>
            </button>

            {canEdit && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onEdit(item);
                }}
                className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-muted/80 transition-colors cursor-pointer text-foreground text-left"
              >
                <Edit2 size={13} className="text-muted-foreground" />
                <span>Edit</span>
              </button>
            )}

            {canUpload && onOpenUpload && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenUpload(item);
                }}
                className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-muted/80 transition-colors cursor-pointer text-foreground text-left"
              >
                <UploadCloud size={13} className="text-muted-foreground" />
                <span>Upload</span>
              </button>
            )}

            {canNewVersion && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onSaveNewVersion(item);
                }}
                className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-muted/80 transition-colors cursor-pointer text-foreground text-left"
              >
                <GitBranch size={13} className="text-muted-foreground" />
                <span>Version</span>
              </button>
            )}

            {canSubmit && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onSubmitForReview(item);
                }}
                className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-muted/80 transition-colors cursor-pointer text-foreground text-left"
              >
                <Send size={13} className="text-muted-foreground" />
                <span>Submit</span>
              </button>
            )}

            {canApprove && onApprove && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onApprove(item);
                }}
                className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-muted/80 transition-colors cursor-pointer text-foreground text-left"
              >
                <CheckCircle2 size={13} className="text-muted-foreground" />
                <span>Approve</span>
              </button>
            )}

            {canPublish && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onPublish(item);
                }}
                className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-muted/80 transition-colors cursor-pointer text-foreground text-left"
              >
                <Check size={13} className="text-muted-foreground" />
                <span>Publish</span>
              </button>
            )}

            {canArchive && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onArchive(item);
                }}
                className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-muted/80 transition-colors cursor-pointer text-foreground text-left"
              >
                <Archive size={13} className="text-muted-foreground" />
                <span>Archive</span>
              </button>
            )}

            {canActivate && onActivate && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onActivate(item);
                }}
                className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-muted/80 transition-colors cursor-pointer text-foreground text-left"
              >
                <RotateCcw size={13} className="text-muted-foreground" />
                <span>Activate</span>
              </button>
            )}

            {canDelete && (
              <>
                <div className="my-1 border-t border-border" />
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onDelete(item);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-destructive/10 text-destructive transition-colors cursor-pointer text-left"
                >
                  <Trash2 size={13} className="text-destructive" />
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>,
          document.body
        )}
    </>
  );
}

export function ContentTable({
  items,
  selectedIds = new Set(),
  onToggleSelect,
  onToggleSelectAll,
  onViewDetail,
  onEdit,
  onSaveNewVersion,
  onSubmitForReview,
  onApprove,
  onPublish,
  onArchive,
  onActivate,
  onDelete,
  onOpenUpload,
  onOpenAddModal,
}: ContentTableProps) {
  const isAllSelected =
    items.length > 0 && items.every((i) => selectedIds.has(i.id));

  if (items.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-12 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
          <Paperclip size={20} />
        </div>
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
    <div className="w-full min-w-0">
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {items.map((item) => {
          const Icon = getContentIcon(item.type);
          const isSelected = selectedIds.has(item.id);

          return (
            <div
              key={item.id}
              className={`bg-card rounded-xl border p-3.5 shadow-2xs transition-colors flex flex-col justify-between gap-3 ${
                isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
              }`}
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  {onToggleSelect && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(item.id)}
                      className="mt-1 rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                    />
                  )}
                  <div className="w-8 h-8 rounded-lg bg-muted/80 flex items-center justify-center text-muted-foreground shrink-0 mt-0.5">
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <ContentTypeBadge type={item.type} />
                      <ContentScopeBadge scope={item.scope} />
                      {item.targetGradeLevels &&
                        item.targetGradeLevels.length > 1 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                            Multi-Grade
                          </span>
                        )}
                      <ContentStatusBadge status={item.status} />
                      <span className="font-mono text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-foreground border border-border">
                        v{item.currentVersion}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-foreground truncate">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
                <ContentRowActions
                  item={item}
                  onViewDetail={onViewDetail}
                  onEdit={onEdit}
                  onOpenUpload={onOpenUpload}
                  onSaveNewVersion={onSaveNewVersion}
                  onSubmitForReview={onSubmitForReview}
                  onApprove={onApprove}
                  onPublish={onPublish}
                  onArchive={onArchive}
                  onActivate={onActivate}
                  onDelete={onDelete}
                />
              </div>

              <div className="pt-2.5 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="truncate max-w-[70%]">
                  {formatContentAlignment(item)}
                </span>
                <span className="shrink-0 flex items-center gap-1">
                  <Paperclip size={11} />
                  {item.attachmentCount}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden md:block bg-card rounded-2xl border border-border shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                {onToggleSelectAll && (
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={onToggleSelectAll}
                      className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                    />
                  </th>
                )}
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-3">Type & Scope</th>
                <th className="py-3 px-4">Alignment</th>
                <th className="py-3 px-3 text-center">Version</th>
                <th className="py-3 px-3 text-center">Files</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => {
                const Icon = getContentIcon(item.type);
                const isSelected = selectedIds.has(item.id);

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors group ${
                      isSelected ? "bg-primary/5" : "hover:bg-muted/30"
                    }`}
                  >
                    {onToggleSelect && (
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect(item.id)}
                          className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                        />
                      </td>
                    )}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-muted/70 flex items-center justify-center text-muted-foreground shrink-0 mt-0.5">
                          <Icon size={14} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground text-xs truncate">
                            {item.title}
                          </div>
                          {item.description && (
                            <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex flex-col gap-1 items-start">
                        <ContentTypeBadge type={item.type} />
                        <ContentScopeBadge scope={item.scope} />
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-foreground text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-muted-foreground block truncate max-w-xs font-medium">
                          {formatContentAlignment(item)}
                        </span>
                        {item.targetGradeLevels &&
                          item.targetGradeLevels.length > 1 && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 shrink-0">
                              Multi-Grade
                            </span>
                          )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-medium text-foreground text-xs">
                      v{item.currentVersion}
                    </td>
                    <td className="py-3.5 px-3 text-center text-muted-foreground text-xs">
                      <span className="inline-flex items-center gap-1">
                        <Paperclip size={11} />
                        {item.attachmentCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <ContentStatusBadge status={item.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <ContentRowActions
                        item={item}
                        onViewDetail={onViewDetail}
                        onEdit={onEdit}
                        onOpenUpload={onOpenUpload}
                        onSaveNewVersion={onSaveNewVersion}
                        onSubmitForReview={onSubmitForReview}
                        onApprove={onApprove}
                        onPublish={onPublish}
                        onArchive={onArchive}
                        onActivate={onActivate}
                        onDelete={onDelete}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
