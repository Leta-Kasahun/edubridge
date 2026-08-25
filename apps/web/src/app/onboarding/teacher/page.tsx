import { Metadata } from "next";
import { TeacherOnboardingWizard } from "@/features/teacher-profile";

export const metadata: Metadata = {
  title: "Teacher Onboarding | EduBridge",
  description: "Complete your teacher profile details to activate your school portal access",
};

export default function TeacherOnboardingPage() {
  return <TeacherOnboardingWizard />;
}
