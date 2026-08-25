import { Metadata } from "next";
import { TeacherProfileView } from "@/features/teacher-profile";

export const metadata: Metadata = {
  title: "My Profile | EduBridge",
  description: "View and update your teacher profile details and credentials",
};

export default function TeacherProfilePage() {
  return (
    <div className="space-y-6">
      <TeacherProfileView />
    </div>
  );
}
