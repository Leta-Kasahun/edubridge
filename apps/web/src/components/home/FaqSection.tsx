"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaqItem {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
}

const FAQ_ITEMS: readonly FaqItem[] = [
  {
    id: "who-for",
    question: "Who is EduBridge for?",
    answer:
      "EduBridge is designed for private schools, academies, tutorial centers, and other learning institutions serving students from Grade 7 to Grade 12.",
  },
  {
    id: "create-materials",
    question: "Can teachers create their own materials?",
    answer:
      "Yes. Teachers can create lessons, assignments, quizzes, homework, and other learning materials.",
  },
  {
    id: "exam-prep-support",
    question: "Can students prepare for Grade 8 and Grade 12 exams?",
    answer:
      "Yes. Students can practice teacher-approved questions, take timed or untimed exams, review results, and identify topics that need more practice.",
  },
  {
    id: "ai-function",
    question: "How does AI help?",
    answer:
      "AI helps teachers create explanations, practice questions, and other learning materials. Teachers review and approve AI-generated content before it is shared with students.",
  },
  {
    id: "student-progress-tracking",
    question: "Can teachers see student progress?",
    answer:
      "Yes. Teachers can see class and individual student performance and identify topics where students may need additional support.",
  },
  {
    id: "offline-support",
    question: "Can students use EduBridge without internet?",
    answer:
      "EduBridge is designed to support learning when internet access is limited. Selected materials and activities can be available offline, with work updated when the connection returns.",
  },
  {
    id: "data-protection",
    question: "Is school information protected?",
    answer:
      "Yes. Each institution has its own protected space. Users can only access information available to them within their school and role.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="py-10 sm:py-20 bg-muted/20 border-b border-border px-3 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-2.5">
          <span className="text-xs font-medium uppercase tracking-widest text-primary">
            Clear Answers
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm font-light text-muted-foreground">
            Everything you need to know about using EduBridge in your school.
          </p>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-8 shadow-xs">
          <Accordion className="w-full">
            {FAQ_ITEMS.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border-b border-border/70 last:border-b-0 py-1"
              >
                <AccordionTrigger className="text-left font-medium text-foreground text-xs sm:text-sm py-4 hover:no-underline hover:text-primary transition-colors">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm font-light text-muted-foreground leading-relaxed pt-1 pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
