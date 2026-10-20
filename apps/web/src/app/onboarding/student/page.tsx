import { Metadata } from "next";
import { StudentOnboardingWizard } from "@/features/students";

export const metadata: Metadata = {
  title: "Student Onboarding | EduBridge",
  description: "Complete your profile details",
};

export default function StudentOnboardingPage() {
  return <StudentOnboardingWizard />;
}
