"use client";

import { useState } from "react";
import {
  Layers,
  ChevronDown,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  FolderGit2,
} from "lucide-react";
import {
  CurriculumUnitItem,
  CurriculumTopicItem,
} from "../types/structure.types";
import {
  useCurriculumTopics,
  useDeleteTopic,
  useReorderStructure,
} from "../hooks/useStructure";
import { TopicItem } from "./TopicItem";
import { TopicFormModal } from "./TopicFormModal";
import { LoadingSpinner, ConfirmDeleteModal, SearchHighlight } from "@/shared/components";

interface UnitItemProps {
  readonly unit: CurriculumUnitItem;
  readonly isFirst: boolean;
  readonly isLast: boolean;
  readonly onEdit: (unit: CurriculumUnitItem) => void;
  readonly onDelete: (unit: CurriculumUnitItem) => void;
  readonly onMoveUp: (unit: CurriculumUnitItem) => void;
  readonly onMoveDown: (unit: CurriculumUnitItem) => void;
  readonly isReadOnly?: boolean;
}

export function UnitItem({
  unit,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isReadOnly = false,
}: UnitItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [topicToEdit, setTopicToEdit] = useState<CurriculumTopicItem | null>(null);
  const [topicToDelete, setTopicToDelete] = useState<CurriculumTopicItem | null>(null);

  const { data: topics = [], isLoading } = useCurriculumTopics(
    unit.id,
    isExpanded
  );

  const deleteTopicMutation = useDeleteTopic();
  const reorderMutation = useReorderStructure();

  const handleConfirmDeleteTopic = async () => {
    if (!topicToDelete) return;
    await deleteTopicMutation.mutateAsync({
      topicId: topicToDelete.id,
      unitId: unit.id,
    });
    setTopicToDelete(null);
  };

  const handleMoveTopic = async (
    topic: CurriculumTopicItem,
    direction: "up" | "down"
  ) => {
    const currentIndex = topics.findIndex((t) => t.id === topic.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= topics.length) return;

    const newOrdered = [...topics];
    const [moved] = newOrdered.splice(currentIndex, 1);
    newOrdered.splice(targetIndex, 0, moved);

    await reorderMutation.mutateAsync({
      entityType: "topic",
      parentId: unit.id,
      orderedIds: newOrdered.map((t) => t.id),
    });
  };

  return (
    <div className="rounded-none border border-border bg-card shadow-xs overflow-hidden transition-all">
      <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 hover:bg-muted/20 transition-colors">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer group"
        >
          <div className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
          <div className="h-9 w-9 rounded-none bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Layers size={18} />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-none bg-muted text-foreground uppercase tracking-wider">
                <SearchHighlight text={unit.code} />
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-foreground truncate">
                <SearchHighlight text={unit.title} />
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-none bg-primary/10 text-primary">
                {topics.length || unit.topicCount} topics
              </span>
            </div>
            {unit.description && !isExpanded && (
              <p className="text-xs text-muted-foreground line-clamp-1 leading-normal">
                <SearchHighlight text={unit.description} />
              </p>
            )}
          </div>
        </button>

        {!isReadOnly && (
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onMoveUp(unit)}
              disabled={isFirst}
              title="Move unit up"
              className="p-1.5 rounded-none text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ArrowUp size={14} />
            </button>
            <button
              type="button"
              onClick={() => onMoveDown(unit)}
              disabled={isLast}
              title="Move unit down"
              className="p-1.5 rounded-none text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ArrowDown size={14} />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsExpanded(true);
                setIsAddTopicOpen(true);
              }}
              title="Add topic"
              className="inline-flex items-center gap-1 h-7.5 px-2.5 rounded-none text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer shrink-0"
            >
              <Plus size={13} />
              <span>Topic</span>
            </button>
            <button
              type="button"
              onClick={() => onEdit(unit)}
              title="Edit unit"
              className="p-1.5 rounded-none text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <Edit2 size={14} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(unit)}
              title="Delete unit"
              className="p-1.5 rounded-none text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="p-3.5 sm:p-5 border-t border-border bg-muted/10 space-y-3.5 animate-in fade-in-0 duration-200">
          {unit.description && (
            <p className="text-xs text-muted-foreground leading-relaxed pl-1">
              {unit.description}
            </p>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center p-6">
              <LoadingSpinner size={24} />
            </div>
          ) : topics.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center rounded-xl border border-dashed border-border bg-card/60 space-y-2.5">
              <div className="h-9 w-9 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
                <FolderGit2 size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">
                  No topics created for this unit
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Break down this unit into specific learning topics
                </p>
              </div>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => setIsAddTopicOpen(true)}
                  className="inline-flex items-center gap-1 h-7.5 px-3 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Topic</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {topics.map((topic, idx) => (
                <TopicItem
                  key={topic.id}
                  topic={topic}
                  isFirst={idx === 0}
                  isLast={idx === topics.length - 1}
                  onEdit={(item) => setTopicToEdit(item)}
                  onDelete={(item) => setTopicToDelete(item)}
                  onMoveUp={(item) => handleMoveTopic(item, "up")}
                  onMoveDown={(item) => handleMoveTopic(item, "down")}
                  isReadOnly={isReadOnly}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <TopicFormModal
        isOpen={isAddTopicOpen || Boolean(topicToEdit)}
        onClose={() => {
          setIsAddTopicOpen(false);
          setTopicToEdit(null);
        }}
        unitId={unit.id}
        itemToEdit={topicToEdit}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(topicToDelete)}
        onClose={() => setTopicToDelete(null)}
        onConfirm={handleConfirmDeleteTopic}
        title="Delete Curriculum Topic"
        description="Are you sure you want to delete this topic and all its learning objectives? This action cannot be undone."
        itemName={topicToDelete ? `${topicToDelete.code}: ${topicToDelete.title}` : undefined}
        isPending={deleteTopicMutation.isPending}
      />
    </div>
  );
}
