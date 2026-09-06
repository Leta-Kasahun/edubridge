import { Building2, BookOpen, GraduationCap, CheckCircle } from "lucide-react";

interface RoleFeatureCategory {
  readonly role: string;
  readonly headline: string;
  readonly icon: React.ComponentType<{ size?: number; className?: string }>;
  readonly items: readonly string[];
}

const ROLE_FEATURES: readonly RoleFeatureCategory[] = [
  {
    role: "For School Administrators",
    headline: "Manage your school in one place.",
    icon: Building2,
    items: [
      "Manage teachers and students",
      "Organize classes, sections, and subjects",
      "Manage academic years",
      "Control what each user can access",
      "Keep school information organized",
    ],
  },
  {
    role: "For Teachers",
    headline: "Give teachers the tools they need to support their students.",
    icon: BookOpen,
    items: [
      "Create lessons and learning materials",
      "Give assignments and homework",
      "Create quizzes and practice activities",
      "Track student performance",
      "See which topics need more attention",
      "Prepare students for exams",
    ],
  },
  {
    role: "For Students",
    headline: "Give students a clear place to learn and improve.",
    icon: GraduationCap,
    items: [
      "Access lessons and learning materials",
      "Complete assignments and quizzes",
      "Practice exam questions",
      "See learning progress",
      "Understand strengths and weak areas",
      "Learn from mistakes with helpful explanations",
    ],
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-10 sm:py-20 bg-background border-b border-border px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-14">
        <div className="text-center max-w-3xl mx-auto space-y-2.5">
          <span className="text-xs font-medium uppercase tracking-widest text-primary">
            Platform Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-foreground">
            Features Designed for Your Entire School Community
          </h2>
          <p className="text-xs sm:text-sm font-light text-muted-foreground">
            A single, organized environment with dedicated tools for administrators, educators, and learners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {ROLE_FEATURES.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.role}
                className="rounded-2xl bg-card border border-border p-4 sm:p-7 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl border border-primary/20 text-primary bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon size={20} />
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        {category.role}
                      </span>
                      <h3 className="text-sm sm:text-base font-medium text-foreground tracking-tight">
                        {category.headline}
                      </h3>
                    </div>
                  </div>

                  <ul className="space-y-3 pt-2">
                    {category.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-xs sm:text-sm font-light text-muted-foreground">
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
