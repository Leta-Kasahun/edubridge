"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { FolderTree, BookOpen, Laptop, Dumbbell, BarChart3, HeartHandshake } from "lucide-react";
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
    title: "School Setup",
    description: "The school creates grades, sections, and assigns teachers and students to their classrooms.",
    icon: FolderTree,
  },
  {
    stepNumber: 2,
    title: "Curriculum Lessons",
    description: "Teachers prepare lessons and classroom notes based on the Ethiopian curriculum, with AI support.",
    icon: BookOpen,
  },
  {
    stepNumber: 3,
    title: "Daily Study",
    description: "Students read lessons, review textbook topics, and complete class assignments on any device.",
    icon: Laptop,
  },
  {
    stepNumber: 4,
    title: "Exam Practice",
    description: "Students practice chapter questions and prepare for Grade 8 and Grade 12 national exams with clear guidance.",
    icon: Dumbbell,
  },
  {
    stepNumber: 5,
    title: "Progress Review",
    description: "Teachers and students easily see quiz scores, subject strengths, and topics that need more practice.",
    icon: BarChart3,
  },
  {
    stepNumber: 6,
    title: "Teacher Support",
    description: "Teachers give extra attention and practice to students who need help so every learner succeeds.",
    icon: HeartHandshake,
  },
];

const easeCurve = [0.16, 1, 0.3, 1] as const;

export function HowItWorksSection() {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  return (
    <section id="how-it-works" className="py-12 sm:py-24 bg-slate-100/80 dark:bg-slate-900/70 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: easeCurve }}
          className="text-center max-w-2xl mx-auto space-y-2"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Simple Step-by-Step
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground font-heading">
            How EduBridge Works in Your School
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            A clear and easy guide showing how administrators, teachers, and students use the platform everyday.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, ease: easeCurve }}
          className="hidden lg:flex flex-row gap-3 min-h-[310px] w-full items-stretch"
        >
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
                  <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-tight leading-snug">
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.65, ease: easeCurve }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4"
        >
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
                  <h3 className="text-base font-semibold text-foreground tracking-tight">
                    {step.stepNumber}. {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-light text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
