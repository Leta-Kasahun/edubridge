import {
  BookOpen,
  Users,
  GraduationCap,
  CalendarCheck,
} from "lucide-react";
import { MetricCard } from "./MetricCard";

export function TeacherDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Assigned Classes"
          value="4"
          change="Active"
          isPositive={true}
          icon={BookOpen}
          detail="Current academic term"
        />
        <MetricCard
          title="Total Students"
          value="142"
          change="Enrolled"
          isPositive={true}
          icon={Users}
          detail="Across all class sections"
        />
        <MetricCard
          title="Attendance Rate"
          value="96.4%"
          change="Normal"
          isPositive={true}
          icon={CalendarCheck}
          detail="Average weekly attendance"
        />
        <MetricCard
          title="Curriculum Progress"
          value="Term 1"
          change="On Track"
          isPositive={true}
          icon={GraduationCap}
          detail="Syllabus coverage"
        />
      </div>
    </div>
  );
}
