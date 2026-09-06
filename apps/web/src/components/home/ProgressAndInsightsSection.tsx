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

export function ProgressAndInsightsSection() {
  return (
    <section id="student-progress" className="py-12 sm:py-20 bg-white dark:bg-slate-950 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Student Progress
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground font-heading">
            Track Mastery by Topic
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Clear four-stage mastery milestones help students and teachers celebrate growth.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {PROGRESS_STAGES.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.title}
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
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
