"use client";

import { useState } from "react";
import { FolderTree, Presentation, BookOpenCheck, Dumbbell, PieChart, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowStep {
  readonly stepNumber: number;
  readonly title: string;
  readonly description: string;
  readonly icon: React.ComponentType<{ size?: number; className?: string }>;
}

const WORKFLOW_STEPS: readonly WorkflowStep[] = [
  {
    stepNumber: 1,
    title: "Organize",
    description: "The school organizes classes, subjects, teachers, students, and academic years.",
    icon: FolderTree,
  },
  {
    stepNumber: 2,
    title: "Teach",
    description: "Teachers create lessons, learning materials, assignments, quizzes, and practice activities.",
    icon: Presentation,
  },
  {
    stepNumber: 3,
    title: "Learn",
    description: "Students access their learning materials and complete their assigned work.",
    icon: BookOpenCheck,
  },
  {
    stepNumber: 4,
    title: "Practice",
    description: "Students practice through quizzes, exercises, and exam-style questions.",
    icon: Dumbbell,
  },
  {
    stepNumber: 5,
    title: "Understand",
    description: "Students and teachers can see progress and identify topics that need more attention.",
    icon: PieChart,
  },
  {
    stepNumber: 6,
    title: "Improve",
    description: "Students continue practicing while teachers provide additional support where needed.",
    icon: TrendingUp,
  },
];

export function HowItWorksSection() {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  return (
    <section id="how-it-works" className="py-12 sm:py-24 bg-slate-100/80 dark:bg-slate-900/70 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Platform Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground font-heading">
            How EduBridge Works
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            A simple, step-by-step cycle from lesson planning to student mastery.
          </p>
        </div>

        <div className="hidden lg:flex flex-row gap-3 min-h-[300px] w-full items-stretch">
          {WORKFLOW_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = activeIndex === index;

            return (
              <div
                key={step.stepNumber}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  "rounded-2xl p-5 border transition-all duration-500 ease-out flex flex-col justify-between overflow-hidden cursor-pointer select-none",
                  isActive
                    ? "flex-[2.8] bg-card border-primary/50 shadow-md ring-1 ring-primary/20"
                    : "flex-[1] bg-card/75 border-border/70 hover:border-primary/30 hover:bg-card"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={cn(
                      "h-8 w-8 rounded-xl flex items-center justify-center font-semibold text-xs transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-primary/10 text-primary border border-primary/20"
                    )}
                  >
                    0{step.stepNumber}
                  </span>

                  <div
                    className={cn(
                      "h-9 w-9 rounded-xl flex items-center justify-center transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "bg-muted/80 text-muted-foreground"
                    )}
                  >
                    <Icon size={18} />
                  </div>
                </div>

                <div className="space-y-2 pt-6">
                  <h3 className="text-base sm:text-lg font-medium text-foreground tracking-tight whitespace-nowrap">
                    {step.title}
                  </h3>

                  <p
                    className={cn(
                      "text-xs sm:text-sm font-light text-muted-foreground leading-relaxed transition-all duration-300",
                      isActive
                        ? "opacity-100 max-h-40 translate-y-0"
                        : "opacity-0 max-h-0 -translate-y-2 pointer-events-none"
                    )}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
          {WORKFLOW_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.stepNumber}
                className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="h-7 w-7 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-semibold text-xs">
                    0{step.stepNumber}
                  </span>
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                    <Icon size={16} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-medium text-foreground tracking-tight">
                    {step.stepNumber}. {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-light text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
