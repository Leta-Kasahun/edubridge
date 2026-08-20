import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  WifiOff,
} from "lucide-react";

interface SystemFeature {
  readonly title: string;
  readonly description: string;
  readonly icon: React.ComponentType<{ size?: number; className?: string }>;
}

const SYSTEM_FEATURES: readonly SystemFeature[] = [
  {
    title: "Grade 8 & 12 Exam Prep",
    description:
      "Comprehensive practice questions and timed mock exams built for Grade 8 regional and Grade 12 national examination success.",
    icon: GraduationCap,
  },
  {
    title: "AI-Powered Study Assistant",
    description:
      "Interactive AI explanations and personalized guidance that helps students master difficult topics and build subject competency.",
    icon: Sparkles,
  },
  {
    title: "Teacher-Approved Content",
    description:
      "Curriculum-aligned practice questions generated with AI assistance and verified by subject teachers for total accuracy.",
    icon: CheckCircle2,
  },
  {
    title: "Weak Internet & PWA Ready",
    description:
      "Lightweight progressive web app engineered to load smoothly and work reliably on slow mobile connections and low bandwidth.",
    icon: WifiOff,
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-16 sm:py-24 bg-background border-b border-border px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            AI-Driven Exam Preparation
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Empowering Grade 8 and Grade 12 students across Ethiopia with intelligent practice tools and teacher-guided study support.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SYSTEM_FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="p-6 sm:p-7 rounded-2xl bg-card border border-border/90 min-h-[250px] flex flex-col justify-between shadow-2xs hover:border-primary/50 transition-all duration-200"
              >
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Icon size={24} className="stroke-[2.2]" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
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
