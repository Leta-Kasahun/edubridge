import { Metadata } from "next";
import { StudentOnboardingWizard } from "@/features/students";

export const metadata: Metadata = {
  title: "Student Onboarding | EduBridge",
  description: "Complete your student profile details to activate your school portal access",
};

export default function StudentOnboardingPage() {
  return <StudentOnboardingWizard />;
}
