"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  MoreVertical,
  Eye,
  Edit2,
  PlusCircle,
  CheckCircle2,
  Archive,
  FileEdit,
} from "lucide-react";
import {
  CurriculumItem,
  CurriculumStatus,
} from "../types/curriculum.types";
import { LoadingSpinner } from "@/shared/components";

interface CurriculaTableProps {
  readonly items: readonly CurriculumItem[];
  readonly onViewDetails: (item: CurriculumItem) => void;
  readonly onEdit: (item: CurriculumItem) => void;
  readonly onAddVersion: (item: CurriculumItem) => void;
  readonly onStatusChange: (item: CurriculumItem, status: CurriculumStatus) => void;
  readonly isUpdatingStatus?: boolean;
}

function StatusBadge({ status }: { readonly status: CurriculumStatus }) {
  switch (status) {
    case "ACTIVE":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-foreground border border-border">
          Active
        </span>
      );
    case "DRAFT":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border">
          Draft
        </span>
      );
    case "ARCHIVED":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border">
          Archived
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
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isSystemScope = item.scope === "SYSTEM" && item.tenantId === null;

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuHeight = isSystemScope ? 45 : 210;
      const menuWidth = 160;
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
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
        disabled={isUpdating}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
        aria-label="Actions"
      >
        {isUpdating ? <LoadingSpinner size={14} /> : <MoreVertical size={16} />}
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
              zIndex: 9999,
            }}
            className="w-40 bg-card border border-border rounded-xl shadow-2xl p-1 animate-in fade-in-0 zoom-in-95"
          >
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onViewDetails(item);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left font-medium"
            >
              <Eye size={13} className="text-muted-foreground" />
              <span>View</span>
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
                  <span>Edit</span>
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
                  <span>Version</span>
                </button>

                <div className="h-px bg-border my-1" />

                {item.status !== "ACTIVE" && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onStatusChange(item, "ACTIVE");
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left font-medium"
                  >
                    <CheckCircle2 size={13} className="text-muted-foreground" />
                    <span>Activate</span>
                  </button>
                )}

                {item.status !== "DRAFT" && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onStatusChange(item, "DRAFT");
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left font-medium"
                  >
                    <FileEdit size={13} />
                    <span>Draft</span>
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
          </div>,
          document.body
        )}
    </>
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
              <span>
                {item.activeVersionName || (item.versionNames && item.versionNames[0]) || `${item.versionCount} versions`}
              </span>
              <span>{item.authorityName || "—"}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block bg-card rounded-2xl border border-border shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Curriculum Name</th>
                <th className="py-3 px-4">Version</th>
                <th className="py-3 px-4">Authority</th>
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
                  <td className="py-3.5 px-4 text-foreground font-medium text-xs">
                    {item.activeVersionName || (item.versionNames && item.versionNames.length > 0 ? item.versionNames.join(", ") : "—")}
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground text-xs">
                    {item.authorityName || "—"}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={item.status} />
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
