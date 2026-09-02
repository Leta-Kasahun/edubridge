"use client";

import { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  Eye,
  Edit2,
  PlusCircle,
  CheckCircle2,
  Archive,
  FileEdit,
  Globe,
  Building2,
  Layers,
  Calendar,
} from "lucide-react";
import {
  CurriculumItem,
  CurriculumScope,
  CurriculumStatus,
} from "../types/curriculum.types";
import { LoadingSpinner } from "@/shared/components";
import { cn } from "@/lib/utils";

interface CurriculaTableProps {
  readonly items: readonly CurriculumItem[];
  readonly onViewDetails: (item: CurriculumItem) => void;
  readonly onEdit: (item: CurriculumItem) => void;
  readonly onAddVersion: (item: CurriculumItem) => void;
  readonly onStatusChange: (item: CurriculumItem, status: CurriculumStatus) => void;
  readonly isUpdatingStatus?: boolean;
}

function ScopeBadge({ scope }: { readonly scope: CurriculumScope }) {
  if (scope === "SYSTEM") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-foreground border border-border">
        <Globe size={11} className="text-muted-foreground" />
        <span>National</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-foreground border border-border">
      <Building2 size={11} className="text-muted-foreground" />
      <span>School</span>
    </span>
  );
}

function StatusBadge({ status }: { readonly status: CurriculumStatus }) {
  switch (status) {
    case "ACTIVE":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-foreground border border-border">
          <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
          <span>Active</span>
        </span>
      );
    case "DRAFT":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border">
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
          <span>Draft</span>
        </span>
      );
    case "ARCHIVED":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border">
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
          <span>Archived</span>
        </span>
      );
  }
}

function CurriculumRowActions({
  item,
  onViewDetails,
  onEdit,
  onAddVersion,
  onStatusChange,
  isUpdating,
}: {
  readonly item: CurriculumItem;
  readonly onViewDetails: (item: CurriculumItem) => void;
  readonly onEdit: (item: CurriculumItem) => void;
  readonly onAddVersion: (item: CurriculumItem) => void;
  readonly onStatusChange: (item: CurriculumItem, status: CurriculumStatus) => void;
  readonly isUpdating: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const isSystemScope = item.scope === "SYSTEM" && item.tenantId === null;

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isUpdating}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
        aria-label="Actions"
      >
        {isUpdating ? <LoadingSpinner size={14} /> : <MoreVertical size={16} />}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-9 w-48 bg-card border border-border rounded-xl shadow-lg p-1 z-30 animate-in fade-in-0 zoom-in-95">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onViewDetails(item);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left font-medium"
          >
            <Eye size={13} className="text-muted-foreground" />
            <span>View Versions & Details</span>
          </button>

          {!isSystemScope && (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onEdit(item);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left font-medium"
              >
                <Edit2 size={13} className="text-muted-foreground" />
                <span>Edit Metadata</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onAddVersion(item);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left font-medium"
              >
                <PlusCircle size={13} className="text-muted-foreground" />
                <span>Create New Version</span>
              </button>

              <div className="my-1 border-t border-border" />

              {item.status !== "ACTIVE" && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onStatusChange(item, "ACTIVE");
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer text-left font-medium"
                >
                  <CheckCircle2 size={13} />
                  <span>Set Active</span>
                </button>
              )}

              {item.status !== "DRAFT" && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onStatusChange(item, "DRAFT");
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer text-left font-medium"
                >
                  <FileEdit size={13} />
                  <span>Set Draft</span>
                </button>
              )}

              {item.status !== "ARCHIVED" && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onStatusChange(item, "ARCHIVED");
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left font-medium"
                >
                  <Archive size={13} />
                  <span>Archive</span>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function CurriculaTable({
  items,
  onViewDetails,
  onEdit,
  onAddVersion,
  onStatusChange,
  isUpdatingStatus = false,
}: CurriculaTableProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-card rounded-2xl border border-border">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
          <Layers size={24} />
        </div>
        <h3 className="text-sm font-bold text-foreground mb-1">
          No Curricula Found
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm">
          No curriculum definitions match the selected filters. Create a new curriculum or clear filters to view available packages.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile Card List (under md breakpoint down to 320px) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-card rounded-xl border border-border p-4 shadow-2xs hover:border-primary/40 transition-colors flex flex-col justify-between gap-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border">
                    {item.code}
                  </span>
                  <ScopeBadge scope={item.scope} />
                  <StatusBadge status={item.status} />
                </div>
                <h4 className="text-sm font-bold text-foreground truncate">
                  {item.name}
                </h4>
                {item.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {item.description}
                  </p>
                )}
              </div>
              <CurriculumRowActions
                item={item}
                onViewDetails={onViewDetails}
                onEdit={onEdit}
                onAddVersion={onAddVersion}
                onStatusChange={onStatusChange}
                isUpdating={isUpdatingStatus}
              />
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Layers size={13} />
                <span>
                  {item.versionCount} {item.versionCount === 1 ? "Version" : "Versions"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={13} />
                <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop / Tablet Table (md and above) */}
      <div className="hidden md:block bg-card rounded-2xl border border-border shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Curriculum Name</th>
                <th className="py-3 px-4">Scope</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Versions</th>
                <th className="py-3 px-4">Authority / Source</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-muted/30 transition-colors group"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                    <span className="px-2 py-1 rounded-md bg-muted border border-border">
                      {item.code}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-foreground text-xs">
                      {item.name}
                    </div>
                    {item.description && (
                      <div className="text-[11px] text-muted-foreground line-clamp-1 max-w-xs">
                        {item.description}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <ScopeBadge scope={item.scope} />
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-foreground">
                      <Layers size={11} className="text-muted-foreground" />
                      {item.versionCount}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground text-xs">
                    {item.authorityName || "—"}
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground text-[11px]">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <CurriculumRowActions
                      item={item}
                      onViewDetails={onViewDetails}
                      onEdit={onEdit}
                      onAddVersion={onAddVersion}
                      onStatusChange={onStatusChange}
                      isUpdating={isUpdatingStatus}
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
