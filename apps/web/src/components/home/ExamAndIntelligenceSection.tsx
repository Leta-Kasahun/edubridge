import { Award, Sparkles, WifiOff, CheckCircle2 } from "lucide-react";

export function ExamAndIntelligenceSection() {
  return (
    <section id="exam-prep" className="py-12 sm:py-20 bg-slate-100/80 dark:bg-slate-900/70 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          <div className="lg:col-span-6 rounded-2xl bg-card border border-border/80 p-5 sm:p-8 shadow-xs flex flex-col justify-between">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                <Award size={15} />
                <span>Exam Preparation</span>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground font-heading">
                  National Exam Readiness
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Focused preparation and practice for Grade 8 and Grade 12 students.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Students can:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Practice approved question sets",
                    "Take timed or self-paced exams",
                    "Review instant scoring & solutions",
                    "Focus on topics that need practice",
                  ].map((item) => (
                    <div
                      key={item}
                      className="p-3 rounded-xl bg-background border border-border/70 flex items-start gap-2.5 text-xs text-muted-foreground"
                    >
                      <CheckCircle2 size={15} className="text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col gap-4 sm:gap-6 justify-between">
            <div className="rounded-2xl bg-card border border-border/80 p-5 sm:p-7 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5 text-primary">
                <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <h3 className="text-sm font-semibold text-foreground tracking-tight">
                  Teacher-Assisted AI
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Smart assistance helps teachers build explanations and practice questions in seconds.
              </p>
              <div className="p-3.5 rounded-xl bg-muted/60 border border-border/70 text-xs text-muted-foreground space-y-1.5">
                <p className="font-medium text-foreground">Teachers are always in control.</p>
                <p>Every activity is reviewed by teachers before students see it.</p>
              </div>
            </div>

            <div className="rounded-2xl bg-card border border-border/80 p-5 sm:p-7 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5 text-primary">
                <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <WifiOff size={16} />
                </div>
                <h3 className="text-sm font-semibold text-foreground tracking-tight">
                  Reliable Offline Access
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Designed to keep working even when school internet is slow or intermittent.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Lessons and practice continue offline, syncing automatically when reconnected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
