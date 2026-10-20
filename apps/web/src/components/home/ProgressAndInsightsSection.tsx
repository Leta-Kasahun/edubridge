"use client";

import { motion } from "motion/react";
import { CheckCircle2, AlertCircle, Clock, Award } from "lucide-react";

interface ProgressStage {
  readonly title: string;
  readonly description: string;
  readonly icon: React.ComponentType<{ size?: number; className?: string }>;
  readonly badgeClass: string;
}

const PROGRESS_STAGES: readonly ProgressStage[] = [
  {
    title: "Not Started",
    description: "The topic has not been started yet.",
    icon: Clock,
    badgeClass: "bg-muted text-muted-foreground border-border",
  },
  {
    title: "Developing",
    description: "Actively learning the concept with guided practice.",
    icon: AlertCircle,
    badgeClass: "bg-primary/10 text-primary border-primary/20",
  },
  {
    title: "Proficient",
    description: "Understands the concept and solves problems accurately.",
    icon: CheckCircle2,
    badgeClass: "bg-primary/15 text-primary border-primary/30",
  },
  {
    title: "Mastered",
    description: "Demonstrates consistent mastery and deep understanding.",
    icon: Award,
    badgeClass: "bg-primary text-primary-foreground border-primary",
  },
];

const easeCurve = [0.16, 1, 0.3, 1] as const;

export function ProgressAndInsightsSection() {
  return (
    <section id="student-progress" className="py-12 sm:py-20 bg-white dark:bg-slate-950 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: easeCurve }}
          className="text-center max-w-2xl mx-auto space-y-2"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Student Progress
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground font-heading">
            Track Mastery by Topic
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Clear four-stage mastery milestones help students and teachers celebrate growth.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {PROGRESS_STAGES.map((stage) => {
            const Icon = stage.icon;
            return (
              <motion.div
                key={stage.title}
                variants={{
                  hidden: { opacity: 0, y: 22 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: easeCurve },
                  },
                }}
                className="p-5 sm:p-7 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between hover:border-primary/40 hover:shadow-sm transition-all space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${stage.badgeClass}`}>
                      {stage.title}
                    </span>
                    <Icon size={18} className="text-muted-foreground" />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {stage.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
