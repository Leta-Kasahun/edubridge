import { Metadata } from "next";
import { TeacherOnboardingWizard } from "@/features/teacher-profile";

export const metadata: Metadata = {
  title: "Teacher Onboarding | EduBridge",
  description: "Complete your profile details",
};

export default function TeacherOnboardingPage() {
  return <TeacherOnboardingWizard />;
}
