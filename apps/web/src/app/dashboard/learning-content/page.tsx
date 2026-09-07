"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function LearningContentDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(ROUTES.LEARNING_CONTENT.MATERIALS);
  }, [router]);

  return null;
}
