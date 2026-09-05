"use client";

import { ChevronDown, Folder, FolderOpen, Plus, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { LearningContentListItem } from "../../types/content.types";
import { ContentTypeBadge } from "./ContentTypeBadge";
import { ContentStatusBadge } from "./ContentStatusBadge";
import { ContentRowActions } from "./ContentTable";
import { getContentIcon } from "../../utils/content-format.util";

export interface SubjectAccordionGroup {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly gradeLevels?: readonly number[];
  readonly materials: readonly LearningContentListItem[];
}

export interface ContentSubjectAccordionProps {
  readonly subject: SubjectAccordionGroup;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
  readonly selectedIds?: ReadonlySet<string>;
  readonly onToggleSelect?: (id: string) => void;
  readonly onViewDetail: (item: LearningContentListItem) => void;
  readonly onEdit: (item: LearningContentListItem) => void;
  readonly onOpenUpload?: (item: LearningContentListItem) => void;
  readonly onSaveNewVersion: (item: LearningContentListItem) => void;
  readonly onSubmitForReview: (item: LearningContentListItem) => void;
  readonly onApprove?: (item: LearningContentListItem) => void;
  readonly onPublish: (item: LearningContentListItem) => void;
  readonly onArchive: (item: LearningContentListItem) => void;
  readonly onDelete: (item: LearningContentListItem) => void;
  readonly onAddMaterial: (subject: SubjectAccordionGroup) => void;
}

export function ContentSubjectAccordion({
  subject,
  isOpen,
  onToggle,
  selectedIds = new Set(),
  onToggleSelect,
  onViewDetail,
  onEdit,
  onOpenUpload,
  onSaveNewVersion,
  onSubmitForReview,
  onApprove,
  onPublish,
  onArchive,
  onDelete,
  onAddMaterial,
}: ContentSubjectAccordionProps) {
  const count = subject.materials.length;

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-xs transition-all">
      <div
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 hover:bg-muted/30 transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <ChevronDown
            size={16}
            className={cn(
              "text-muted-foreground transition-transform duration-200 shrink-0",
              isOpen && "transform rotate-180"
            )}
          />

          <div className="flex items-center justify-center shrink-0 text-amber-500 dark:text-amber-400">
            {isOpen ? (
              <FolderOpen
                size={20}
                className="fill-amber-500/20 dark:fill-amber-400/20"
              />
            ) : (
              <Folder
                size={20}
                className="fill-amber-500/20 dark:fill-amber-400/20"
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs sm:text-sm font-bold text-foreground truncate">
                {subject.name}
              </h3>
              {subject.code && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border uppercase">
                  {subject.code}
                </span>
              )}
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {count} {count === 1 ? "material" : "materials"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddMaterial(subject);
            }}
            title="Add material to this subject"
            className="inline-flex items-center gap-1 h-7.5 px-2.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer shrink-0"
          >
            <Plus size={13} />
            <span className="hidden sm:inline">Material</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-border bg-background/50">
          {count === 0 ? (
            <div className="px-6 py-8 text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mb-2">
                <Folder size={18} className="text-muted-foreground" />
              </div>
              <p className="text-xs font-medium text-foreground mb-1">
                No materials in this subject yet
              </p>
              <p className="text-[11px] text-muted-foreground mb-3 max-w-xs">
                Upload textbooks, reference books, exercises, or guides to get started.
              </p>
              <button
                type="button"
                onClick={() => onAddMaterial(subject)}
                className="inline-flex items-center gap-1.5 h-7.5 px-3 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs"
              >
                <Plus size={13} />
                <span>Upload Material</span>
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-2.5 p-3 md:hidden">
                {subject.materials.map((item) => {
                  const Icon = getContentIcon(item.type);
                  const isSelected = selectedIds.has(item.id);

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "bg-card rounded-xl border p-3 shadow-2xs transition-colors flex flex-col justify-between gap-2.5",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          {onToggleSelect && (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => onToggleSelect(item.id)}
                              className="mt-1 rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                            />
                          )}
                          <div className="w-7 h-7 rounded-lg bg-muted/70 flex items-center justify-center text-foreground shrink-0 mt-0.5">
                            <Icon size={14} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <ContentTypeBadge type={item.type} />
                              <ContentStatusBadge status={item.status} />
                              <span className="font-mono text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-foreground border border-border">
                                v{item.currentVersion}
                              </span>
                              {item.targetGradeLevels &&
                                item.targetGradeLevels.length > 1 && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                                    Grades {item.targetGradeLevels.join(", ")}
                                  </span>
                                )}
                            </div>
                            <h4 className="text-xs font-bold text-foreground truncate">
                              {item.title}
                            </h4>
                            {item.description && (
                              <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
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
                          onDelete={onDelete}
                        />
                      </div>

                      <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="truncate max-w-[70%]">
                          {item.unitTitle || subject.name}
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

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                  <thead>
                    <tr className="border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/20">
                      {onToggleSelect && <th className="py-2.5 px-3 w-10 text-center" />}
                      <th className="py-2.5 px-4">Material</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3 text-center">Files</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {subject.materials.map((item) => {
                      const Icon = getContentIcon(item.type);
                      const isSelected = selectedIds.has(item.id);

                      return (
                        <tr
                          key={item.id}
                          className={cn(
                            "transition-colors group",
                            isSelected ? "bg-primary/5" : "hover:bg-muted/30"
                          )}
                        >
                          {onToggleSelect && (
                            <td className="py-3 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => onToggleSelect(item.id)}
                                className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                              />
                            </td>
                          )}

                          <td className="py-3 px-4 max-w-sm">
                            <div className="flex items-start gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-muted/70 flex items-center justify-center text-foreground shrink-0 mt-0.5">
                                <Icon size={14} />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-semibold text-foreground text-xs truncate">
                                    {item.title}
                                  </span>
                                  <span className="font-mono text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border shrink-0">
                                    v{item.currentVersion}
                                  </span>
                                  {item.targetGradeLevels &&
                                    item.targetGradeLevels.length > 1 && (
                                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 shrink-0">
                                        Grades {item.targetGradeLevels.join(", ")}
                                      </span>
                                    )}
                                </div>
                                {item.description && (
                                  <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                                    {item.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <ContentTypeBadge type={item.type} />
                          </td>

                          <td className="py-3 px-3 text-center text-muted-foreground text-xs">
                            <span className="inline-flex items-center gap-1">
                              <Paperclip size={11} />
                              {item.attachmentCount}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <ContentStatusBadge status={item.status} />
                          </td>

                          <td className="py-3 px-4 text-right">
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
                              onDelete={onDelete}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
