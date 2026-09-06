import { BarChart3, LineChart, CheckCircle2, AlertCircle, Clock, Award } from "lucide-react";

interface ProgressStage {
  readonly title: string;
  readonly description: string;
  readonly icon: React.ComponentType<{ size?: number; className?: string }>;
  readonly badgeClass: string;
}

const PROGRESS_STAGES: readonly ProgressStage[] = [
  {
    title: "Not Started",
    description: "The student has not worked on the topic yet.",
    icon: Clock,
    badgeClass: "bg-muted text-muted-foreground border-border",
  },
  {
    title: "Developing",
    description: "The student is learning the topic and needs more practice.",
    icon: AlertCircle,
    badgeClass: "bg-primary/10 text-primary border-primary/20",
  },
  {
    title: "Proficient",
    description: "The student understands the topic well.",
    icon: CheckCircle2,
    badgeClass: "bg-primary/15 text-primary border-primary/30",
  },
  {
    title: "Mastered",
    description: "The student has shown strong understanding.",
    icon: Award,
    badgeClass: "bg-primary text-primary-foreground border-primary",
  },
];

const TEACHER_INSIGHTS = [
  "What students are doing well",
  "Which topics are difficult",
  "Which students may need more support",
  "Where additional practice may help",
] as const;

export function ProgressAndInsightsSection() {
  return (
    <section id="student-progress" className="py-10 sm:py-20 bg-background border-b border-border px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-2.5">
          <span className="text-xs font-medium uppercase tracking-widest text-primary">
            Student Progress &amp; Insights
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-foreground">
            Learning is more than a single score.
          </h2>
          <p className="text-xs sm:text-sm font-light text-muted-foreground">
            EduBridge helps students and teachers understand progress by topic.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {PROGRESS_STAGES.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.title}
                className="p-4 sm:p-6 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between hover:border-primary/40 transition-all space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-lg border text-xs font-medium ${stage.badgeClass}`}>
                      {stage.title}
                    </span>
                    <Icon size={18} className="text-muted-foreground" />
                  </div>
                  <p className="text-xs sm:text-sm font-light text-muted-foreground leading-relaxed">
                    {stage.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl bg-muted/30 border border-border p-4 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                <LineChart size={15} />
                <span>Teacher Insights</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-light tracking-tight text-foreground">
                Teachers can quickly understand how their students are doing.
              </h3>
              <p className="text-xs sm:text-sm font-light text-muted-foreground leading-relaxed">
                This helps teachers focus their time where it matters most.
              </p>
            </div>

            <div className="lg:col-span-6">
              <div className="space-y-2.5">
                <span className="text-xs font-medium text-foreground uppercase tracking-wider">
                  They can see:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TEACHER_INSIGHTS.map((insight) => (
                    <div
                      key={insight}
                      className="p-3.5 rounded-xl bg-card border border-border flex items-start gap-2.5 text-xs font-light text-muted-foreground shadow-2xs"
                    >
                      <BarChart3 size={15} className="text-primary shrink-0 mt-0.5" />
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
