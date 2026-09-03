"use client";

import { useState } from "react";
import {
  FolderGit2,
  ChevronDown,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Target,
} from "lucide-react";
import {
  CurriculumTopicItem,
  LearningObjectiveItem,
} from "../types/structure.types";
import {
  useLearningObjectives,
  useDeleteObjective,
  useReorderStructure,
} from "../hooks/useStructure";
import { ObjectiveItem } from "./ObjectiveItem";
import { ObjectiveFormModal } from "./ObjectiveFormModal";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { LoadingSpinner } from "@/shared/components";

interface TopicItemProps {
  readonly topic: CurriculumTopicItem;
  readonly isFirst: boolean;
  readonly isLast: boolean;
  readonly onEdit: (topic: CurriculumTopicItem) => void;
  readonly onDelete: (topic: CurriculumTopicItem) => void;
  readonly onMoveUp: (topic: CurriculumTopicItem) => void;
  readonly onMoveDown: (topic: CurriculumTopicItem) => void;
}

export function TopicItem({
  topic,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: TopicItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddObjectiveOpen, setIsAddObjectiveOpen] = useState(false);
  const [objectiveToEdit, setObjectiveToEdit] = useState<LearningObjectiveItem | null>(null);
  const [objectiveToDelete, setObjectiveToDelete] = useState<LearningObjectiveItem | null>(null);

  const { data: objectives = [], isLoading, isFetching } = useLearningObjectives(
    topic.id,
    isExpanded
  );

  const deleteObjectiveMutation = useDeleteObjective();
  const reorderMutation = useReorderStructure();

  const handleConfirmDeleteObjective = async () => {
    if (!objectiveToDelete) return;
    await deleteObjectiveMutation.mutateAsync({
      objectiveId: objectiveToDelete.id,
      topicId: topic.id,
    });
    setObjectiveToDelete(null);
  };

  const handleMoveObjective = async (
    objective: LearningObjectiveItem,
    direction: "up" | "down"
  ) => {
    const currentIndex = objectives.findIndex((o) => o.id === objective.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= objectives.length) return;

    const newOrdered = [...objectives];
    const [moved] = newOrdered.splice(currentIndex, 1);
    newOrdered.splice(targetIndex, 0, moved);

    await reorderMutation.mutateAsync({
      entityType: "objective",
      parentId: topic.id,
      orderedIds: newOrdered.map((o) => o.id),
    });
  };

  return (
    <div className="rounded-xl border border-border/80 bg-background/60 overflow-hidden transition-all">
      <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3 hover:bg-muted/30 transition-colors">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer group"
        >
          <div className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
          <div className="h-7 w-7 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center shrink-0">
            <FolderGit2 size={14} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-sm bg-muted text-foreground uppercase tracking-wider">
                {topic.code}
              </span>
              <span className="text-xs font-semibold text-foreground truncate">
                {topic.title}
              </span>
              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-full bg-muted/80 text-muted-foreground">
                {objectives.length || topic.objectiveCount} objectives
              </span>
            </div>
          </div>
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onMoveUp(topic)}
            disabled={isFirst}
            title="Move topic up"
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ArrowUp size={13} />
          </button>
          <button
            type="button"
            onClick={() => onMoveDown(topic)}
            disabled={isLast}
            title="Move topic down"
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ArrowDown size={13} />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsExpanded(true);
              setIsAddObjectiveOpen(true);
            }}
            title="Add learning objective"
            className="inline-flex items-center gap-1 h-7.5 px-2.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer shrink-0"
          >
            <Plus size={12} />
            <span>Objective</span>
          </button>
          <button
            type="button"
            onClick={() => onEdit(topic)}
            title="Edit topic"
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <Edit2 size={13} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(topic)}
            title="Delete topic"
            className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 sm:p-4 border-t border-border/70 bg-card/40 space-y-2.5 animate-in fade-in-0 duration-200">
          {topic.description && (
            <p className="text-xs text-muted-foreground leading-relaxed pl-1 pb-1">
              {topic.description}
            </p>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <LoadingSpinner size={20} />
            </div>
          ) : objectives.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-5 text-center rounded-xl border border-dashed border-border bg-muted/20 space-y-2">
              <div className="h-8 w-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center">
                <Target size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  No learning objectives defined yet
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Define specific competency criteria for this topic
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddObjectiveOpen(true)}
                className="inline-flex items-center gap-1 h-7.5 px-3 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
              >
                <Plus size={12} />
                <span>Objective</span>
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {objectives.map((obj, idx) => (
                <ObjectiveItem
                  key={obj.id}
                  objective={obj}
                  isFirst={idx === 0}
                  isLast={idx === objectives.length - 1}
                  onEdit={(item) => setObjectiveToEdit(item)}
                  onDelete={(item) => setObjectiveToDelete(item)}
                  onMoveUp={(item) => handleMoveObjective(item, "up")}
                  onMoveDown={(item) => handleMoveObjective(item, "down")}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <ObjectiveFormModal
        isOpen={isAddObjectiveOpen || Boolean(objectiveToEdit)}
        onClose={() => {
          setIsAddObjectiveOpen(false);
          setObjectiveToEdit(null);
        }}
        topicId={topic.id}
        itemToEdit={objectiveToEdit}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(objectiveToDelete)}
        onClose={() => setObjectiveToDelete(null)}
        onConfirm={handleConfirmDeleteObjective}
        title="Delete Learning Objective"
        description="Are you sure you want to delete this learning objective? This action cannot be undone."
        itemName={objectiveToDelete ? `${objectiveToDelete.code}: ${objectiveToDelete.statement}` : undefined}
        isPending={deleteObjectiveMutation.isPending}
      />
    </div>
  );
}
