"use client";

import { useState } from "react";
import { X, Users, Calendar, Check } from "lucide-react";
import { SubmitButton } from "@/shared/components/SubmitButton";
import { SectionRecord } from "@/features/academic";
import { AssessmentItem, AssignAssessmentPayload } from "../types/assessment.types";

interface AssessmentAssignModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (payload: AssignAssessmentPayload) => Promise<void>;
  readonly assessment: AssessmentItem;
  readonly sections: readonly SectionRecord[];
  readonly isLoading?: boolean;
}

export function AssessmentAssignModal({
  isOpen,
  onClose,
  onSubmit,
  assessment,
  sections,
  isLoading = false,
}: AssessmentAssignModalProps) {
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>(() => {
    return (assessment.assignments || []).map((a) => a.sectionId);
  });
  const [dueAt, setDueAt] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const toggleSection = (id: string) => {
    setSelectedSectionIds((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedSectionIds.length === sections.length) {
      setSelectedSectionIds([]);
    } else {
      setSelectedSectionIds(sections.map((s) => s.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSectionIds.length === 0) {
      setError("Please select at least one section");
      return;
    }

    await onSubmit({
      sectionIds: selectedSectionIds,
      dueAt: dueAt ? new Date(dueAt).toISOString() : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
      <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Users size={18} />
            </div>
            <div>
              <h2 className="font-bold text-base text-foreground">
                Assign to Class Sections
              </h2>
              <p className="text-xs text-muted-foreground truncate max-w-xs">
                {assessment.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-foreground">
                Select Class Sections ({selectedSectionIds.length} selected)
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-semibold text-primary hover:underline"
              >
                {selectedSectionIds.length === sections.length ? "Deselect All" : "Select All"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-border rounded-xl bg-muted/20">
              {sections.length === 0 ? (
                <p className="text-xs text-muted-foreground p-4 text-center col-span-2">
                  No active sections found in your school.
                </p>
              ) : (
                sections.map((section) => {
                  const isChecked = selectedSectionIds.includes(section.id);
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isChecked
                          ? "bg-primary/10 border-primary text-foreground font-semibold"
                          : "bg-card border-border text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="text-xs block truncate">{section.name}</span>
                        {section.code && (
                          <span className="text-[10px] text-muted-foreground">
                            Code: {section.code}
                          </span>
                        )}
                      </div>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ml-2 ${
                          isChecked
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-border"
                        }`}
                      >
                        {isChecked && <Check size={12} strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            {error && <p className="text-xs text-rose-500 mt-1.5">{error}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
              <Calendar size={14} className="text-primary/70" />
              Submission Due Date (Optional)
            </label>
            <input
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <SubmitButton
              isLoading={isLoading}
              size="sm"
              className="w-auto"
            >
              Publish & Assign
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
