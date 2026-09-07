"use client";

import { use } from "react";
import { StudentQuestionPracticeView } from "@/features/question-bank";

interface PracticePageProps {
  readonly params: Promise<{ id: string }>;
}

export default function PracticePage({ params }: PracticePageProps) {
  const resolvedParams = use(params);

  return <StudentQuestionPracticeView bankId={resolvedParams.id} />;
}
