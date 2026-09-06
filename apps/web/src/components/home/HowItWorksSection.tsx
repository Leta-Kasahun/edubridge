import { FolderTree, Presentation, BookOpenCheck, Dumbbell, PieChart, TrendingUp } from "lucide-react";

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
  return (
    <section id="how-it-works" className="py-10 sm:py-20 bg-muted/20 border-b border-border px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-2.5">
          <span className="text-xs font-medium uppercase tracking-widest text-primary">
            Clear Educational Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-foreground">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm font-light text-muted-foreground">
            A continuous, six-step cycle connecting school administration, classroom teaching, and student mastery.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {WORKFLOW_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.stepNumber}
                className="p-4 sm:p-6 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="h-7 w-7 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-medium text-xs">
                    0{step.stepNumber}
                  </span>
                  <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                    <Icon size={18} />
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
