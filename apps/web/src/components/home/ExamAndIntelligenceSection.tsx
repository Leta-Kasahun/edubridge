import { Award, Sparkles, WifiOff, CheckCircle2 } from "lucide-react";

export function ExamAndIntelligenceSection() {
  return (
    <section id="exam-prep" className="py-10 sm:py-20 bg-muted/25 border-b border-border px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-6 rounded-2xl bg-card border border-border p-4 sm:p-8 shadow-xs flex flex-col justify-between">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                <Award size={15} />
                <span>Exam Preparation</span>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-light tracking-tight text-foreground">
                  Help students prepare for important exams.
                </h2>
                <p className="text-xs sm:text-sm font-light text-muted-foreground leading-relaxed">
                  EduBridge supports focused preparation for Grade 8 and Grade 12.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <span className="text-xs font-medium text-foreground uppercase tracking-wider">
                  Students can:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Practice teacher-approved questions",
                    "Take timed or untimed exams",
                    "Review their results",
                    "See which topics need more practice",
                  ].map((item) => (
                    <div
                      key={item}
                      className="p-3 rounded-xl bg-background border border-border flex items-start gap-2.5 text-xs font-light text-muted-foreground"
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
            <div className="rounded-2xl bg-card border border-border p-4 sm:p-7 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5 text-primary">
                <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <h3 className="text-sm font-medium text-foreground uppercase tracking-wider">
                  AI Support
                </h3>
              </div>
              <p className="text-xs sm:text-sm font-light text-muted-foreground leading-relaxed">
                AI helps teachers create learning materials and practice questions more quickly.
              </p>
              <div className="p-3.5 rounded-xl bg-muted/50 border border-border text-xs font-light text-muted-foreground space-y-2">
                <p className="font-normal text-foreground">Teachers remain in control.</p>
                <p>AI-generated content is reviewed by teachers before it is shared with students.</p>
                <div className="inline-block px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary font-medium text-xs">
                  AI helps. Teachers decide.
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-card border border-border p-4 sm:p-7 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5 text-primary">
                <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <WifiOff size={16} />
                </div>
                <h3 className="text-sm font-medium text-foreground uppercase tracking-wider">
                  Learning With Limited Internet
                </h3>
              </div>
              <p className="text-xs sm:text-sm font-light text-muted-foreground leading-relaxed">
                EduBridge is designed for learning environments where internet access may not always be reliable.
              </p>
              <p className="text-xs font-light text-muted-foreground leading-relaxed">
                Selected learning materials and activities can be available without a continuous connection, with student work updated when the connection returns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
