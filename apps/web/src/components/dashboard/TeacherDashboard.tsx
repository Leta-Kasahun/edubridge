"use client";

import {
  BookOpen,
  Users,
  CalendarCheck,
  User,
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
          title="Students"
          value="Enrolled"
          change="Active"
          isPositive={true}
          icon={Users}
          detail="Classroom cohorts"
        />
        <MetricCard
          title="Attendance"
          value="96.4%"
          change="Normal"
          isPositive={true}
          icon={CalendarCheck}
          detail="Weekly average rate"
        />
        <MetricCard
          title="Profile"
          value="Verified"
          change="Active"
          isPositive={true}
          icon={User}
          detail="Teacher account"
        />
      </div>
    </div>
  );
}
