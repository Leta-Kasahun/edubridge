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
    id: "grade-focus",
    question: "How does EduBridge help Grade 8 and Grade 12 students prepare for national exams?",
    answer:
      "EduBridge provides targeted practice question banks and realistic mock exams structured around the Ethiopian national curriculum. Students can take timed tests, view step-by-step solutions, and identify which subjects need more practice before their real exams.",
  },
  {
    id: "ai-support",
    question: "How does AI support student learning?",
    answer:
      "Our AI assistant breaks down complicated questions into easy-to-understand explanations, recommends personalized study areas based on student performance, and assists in generating practice problems that match the student's learning level.",
  },
  {
    id: "teacher-approved",
    question: "Are the practice questions verified by teachers?",
    answer:
      "Yes. All AI-generated practice questions and study materials are reviewed and approved by experienced subject teachers to ensure they follow the official Ethiopian educational guidelines and exam standards.",
  },
  {
    id: "first-login",
    question: "How do students log in for the first time?",
    answer:
      "Students use the ID and temporary password provided by their school. On the First Login Setup page, students enter their credentials to activate their account and set up their personal password for everyday study access.",
  },
  {
    id: "slow-internet",
    question: "Can students use EduBridge on slow or weak internet connections?",
    answer:
      "Yes. EduBridge is built as a lightweight progressive web app (PWA) optimized to load quickly and work smoothly even on weak mobile connections, using very little data.",
  },
];

export function FaqSection() {
  return (
    <section
      id="faq"
      className="py-16 sm:py-24 bg-muted/30 border-b border-border px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Learn more about AI exam preparation, student access, and practice modules.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-2xs">
          <Accordion className="w-full">
            {FAQ_ITEMS.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border-b border-border/80 last:border-b-0 py-1"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground text-sm sm:text-base py-4 hover:no-underline hover:text-primary transition-colors">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pt-1 pb-4">
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
