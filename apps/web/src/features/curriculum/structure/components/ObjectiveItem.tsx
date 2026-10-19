"use client";

import { Target, Edit2, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { LearningObjectiveItem } from "../types/structure.types";
import { SearchHighlight } from "@/shared/components";

interface ObjectiveItemProps {
  readonly objective: LearningObjectiveItem;
  readonly isFirst: boolean;
  readonly isLast: boolean;
  readonly onEdit: (objective: LearningObjectiveItem) => void;
  readonly onDelete: (objective: LearningObjectiveItem) => void;
  readonly onMoveUp: (objective: LearningObjectiveItem) => void;
  readonly onMoveDown: (objective: LearningObjectiveItem) => void;
  readonly isReadOnly?: boolean;
}

export function ObjectiveItem({
  objective,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isReadOnly = false,
}: ObjectiveItemProps) {
  return (
    <div className="flex items-start sm:items-center justify-between gap-3 p-2.5 sm:p-3 rounded-xl bg-card border border-border/70 hover:border-border transition-colors group">
      <div className="flex items-start gap-2.5 min-w-0 flex-1">
        <div className="h-6 w-6 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
          <Target size={12} />
        </div>
        <div className="space-y-0.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-sm bg-muted text-foreground uppercase tracking-wider">
              <SearchHighlight text={objective.code} />
            </span>
            <span className="text-xs font-medium text-foreground leading-relaxed">
              <SearchHighlight text={objective.statement} />
            </span>
          </div>
          {objective.description && (
            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-normal">
              <SearchHighlight text={objective.description} />
            </p>
          )}
        </div>
      </div>

      {!isReadOnly && (
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onMoveUp(objective)}
            disabled={isFirst}
            title="Move up"
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ArrowUp size={13} />
          </button>
          <button
            type="button"
            onClick={() => onMoveDown(objective)}
            disabled={isLast}
            title="Move down"
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ArrowDown size={13} />
          </button>
          <button
            type="button"
            onClick={() => onEdit(objective)}
            title="Edit objective"
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <Edit2 size={13} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(objective)}
            title="Delete objective"
            className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
