"use client";

import { ReactNode } from "react";
import Link from "next/link";
import {
  Folder,
  FolderOpen,
  ChevronDown,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { QuestionBankItem } from "../../types/question-bank.types";

export interface BankSubjectAccordionGroup {
  readonly id: string;
  readonly name: string;
  readonly code?: string;
  readonly banks: readonly QuestionBankItem[];
}

interface QuestionBankSubjectAccordionProps {
  readonly group: BankSubjectAccordionGroup;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
  readonly onEdit: (bank: QuestionBankItem) => void;
  readonly onDelete: (id: string, name: string) => void;
  readonly isDeleting?: boolean;
  readonly renderRowActions: (bank: QuestionBankItem) => ReactNode;
}

export function QuestionBankSubjectAccordion({
  group,
  isOpen,
  onToggle,
  renderRowActions,
}: QuestionBankSubjectAccordionProps) {
  const totalQuestions = group.banks.reduce(
    (acc, b) => acc + (b.questionCount || 0),
    0
  );

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden transition-all shadow-xs">
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
                {group.name}
              </h3>
              {group.code && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border uppercase">
                  {group.code}
                </span>
              )}
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {group.banks.length} {group.banks.length === 1 ? "bank" : "banks"}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                {totalQuestions} {totalQuestions === 1 ? "question" : "questions"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-border">
          {group.banks.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No question banks found for this subject.
            </div>
          ) : (
            <div>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-muted-foreground font-semibold">
                      <th className="py-2.5 px-4">Bank Name</th>
                      <th className="py-2.5 px-4">Grade</th>
                      <th className="py-2.5 px-3 text-center">Questions</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Created Date</th>
                      <th className="py-2.5 px-4 text-right w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {group.banks.map((bank) => {
                      const formattedDate = bank.createdAt
                        ? new Date(bank.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—";

                      return (
                        <tr
                          key={bank.id}
                          className="hover:bg-muted/20 transition-colors group"
                        >
                          <td className="py-3 px-4 max-w-xs">
                            <div className="flex items-start gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-muted/70 flex items-center justify-center text-muted-foreground shrink-0 mt-0.5">
                                <BookOpen size={14} />
                              </div>
                              <div className="min-w-0">
                                <Link
                                  href={`/dashboard/question-banks/${bank.id}`}
                                  className="font-semibold text-foreground hover:text-primary transition-colors block text-xs truncate"
                                >
                                  {bank.name}
                                </Link>
                                {bank.description && (
                                  <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                                    {bank.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-foreground text-xs">
                            <span className="text-muted-foreground">
                              {bank.grade?.level
                                ? `Grade ${bank.grade.level}`
                                : "All Grades"}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-center font-medium text-foreground text-xs">
                            <span className="font-semibold text-foreground">
                              {bank.questionCount}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-foreground border border-border">
                              {bank.status}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-muted-foreground text-xs">
                            {formattedDate}
                          </td>

                          <td className="py-3 px-4 text-right w-24">
                            {renderRowActions(bank)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden divide-y divide-border">
                {group.banks.map((bank) => {
                  const formattedDate = bank.createdAt
                    ? new Date(bank.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—";

                  return (
                    <div
                      key={bank.id}
                      className="p-4 space-y-2.5 hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-muted/70 flex items-center justify-center text-muted-foreground shrink-0 mt-0.5">
                            <BookOpen size={14} />
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/dashboard/question-banks/${bank.id}`}
                              className="font-semibold text-foreground hover:text-primary transition-colors block text-xs"
                            >
                              {bank.name}
                            </Link>
                            {bank.description && (
                              <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                                {bank.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {renderRowActions(bank)}
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/60">
                        <span>
                          {bank.grade?.level
                            ? `Grade ${bank.grade.level}`
                            : "All Grades"}
                        </span>
                        <span>{bank.questionCount} questions</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-foreground border border-border">
                          {bank.status}
                        </span>
                        <span>{formattedDate}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
