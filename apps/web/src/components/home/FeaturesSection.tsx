import { Building2, BookOpen, GraduationCap, CheckCircle } from "lucide-react";

interface RoleFeatureCategory {
  readonly role: string;
  readonly headline: string;
  readonly icon: React.ComponentType<{ size?: number; className?: string }>;
  readonly items: readonly string[];
}

const ROLE_FEATURES: readonly RoleFeatureCategory[] = [
  {
    role: "Administrators",
    headline: "Simple school management.",
    icon: Building2,
    items: [
      "Manage teachers and students",
      "Organize classes, sections, and subjects",
      "Set up academic terms and schedules",
      "Control permissions and accounts",
      "Keep records secure and organized",
    ],
  },
  {
    role: "Teachers",
    headline: "Engaging classroom tools.",
    icon: BookOpen,
    items: [
      "Create lessons and study materials",
      "Assign homework and interactive quizzes",
      "Track student progress by topic",
      "Identify students who need support",
      "Prepare classes for major exams",
    ],
  },
  {
    role: "Students",
    headline: "Clear learning and practice.",
    icon: GraduationCap,
    items: [
      "Access lessons from anywhere",
      "Complete assignments with instant feedback",
      "Practice real exam questions",
      "Track topic mastery step by step",
      "Review mistakes with clear explanations",
    ],
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-12 sm:py-20 bg-white dark:bg-slate-950 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Platform Features
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground font-heading">
            Built for Your Entire School
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Dedicated tools for administrators, teachers, and students in one simple platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {ROLE_FEATURES.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.role}
                className="rounded-2xl bg-card border border-border/80 p-5 sm:p-7 shadow-xs hover:border-primary/40 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl border border-primary/20 text-primary bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon size={20} />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block">
                        {category.role}
                      </span>
                      <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
                        {category.headline}
                      </h3>
                    </div>
                  </div>

                  <ul className="space-y-2.5 pt-2">
                    {category.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-xs sm:text-sm text-muted-foreground">
                        <CheckCircle size={15} className="text-primary shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
