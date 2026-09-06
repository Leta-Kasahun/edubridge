"use client";

import { use } from "react";
import { StudentMaterialReaderView } from "@/features/learning-content";

interface LearnPageProps {
  readonly params: Promise<{ id: string }>;
}

export default function LearnPage({ params }: LearnPageProps) {
  const resolvedParams = use(params);

  return <StudentMaterialReaderView contentId={resolvedParams.id} />;
}
