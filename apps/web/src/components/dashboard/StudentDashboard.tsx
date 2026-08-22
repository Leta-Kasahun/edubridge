import {
  BookOpen,
  Award,
  CalendarCheck,
  GraduationCap,
} from "lucide-react";
import { MetricCard } from "./MetricCard";

export function StudentDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Enrolled Subjects"
          value="6"
          change="Current"
          isPositive={true}
          icon={BookOpen}
          detail="Active subjects this term"
        />
        <MetricCard
          title="Attendance"
          value="98.2%"
          change="Good"
          isPositive={true}
          icon={CalendarCheck}
          detail="Term attendance record"
        />
        <MetricCard
          title="GPA / Standing"
          value="3.8"
          change="Honors"
          isPositive={true}
          icon={Award}
          detail="Cumulative grade point"
        />
        <MetricCard
          title="Academic Program"
          value="2025/26"
          change="Grade 11"
          isPositive={true}
          icon={GraduationCap}
          detail="Current grade level"
        />
      </div>
    </div>
  );
}
