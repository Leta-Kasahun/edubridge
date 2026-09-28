import React from "react";
import { ChevronRight, Award } from "lucide-react";
import { StudentMasteryTopicItem } from "../types/mastery.types";
import { TopicMasteryBadge } from "./TopicMasteryBadge";
import { MasteryProgressBar } from "./MasteryProgressBar";

interface StudentMasteryCardProps {
  readonly topic: StudentMasteryTopicItem;
  readonly onClick?: () => void;
}

export function StudentMasteryCard({
  topic,
  onClick,
}: StudentMasteryCardProps): React.JSX.Element {
  const isEvaluated = topic.accuracy !== null && topic.accuracy !== undefined;

  return (
    <div
      onClick={onClick}
      className={`p-3.5 bg-card rounded-xl border border-border shadow-2xs hover:border-primary/40 hover:shadow-xs transition-all flex flex-col justify-between gap-3 ${
        onClick ? "cursor-pointer group" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-wider">
            {topic.topicCode}
          </span>
          <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {topic.topicTitle}
          </h4>
        </div>
        <TopicMasteryBadge level={topic.level} />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {topic.correctCount} / {topic.questionCount} Questions Correct
          </span>
          <span className="font-semibold text-foreground">
            {isEvaluated ? `${topic.accuracy}%` : "Not evaluated"}
          </span>
        </div>
        <MasteryProgressBar
          value={topic.accuracy ?? 0}
          size="sm"
        />
      </div>

      {onClick && (
        <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground group-hover:text-primary transition-colors">
          <span className="flex items-center gap-1 font-medium">
            <Award className="w-3 h-3 text-primary" /> View Progress
          </span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
}
