import Link from "next/link";
import {
  Users,
  UserCheck,
  BookOpen,
  CalendarCheck,
  TrendingUp,
  UserPlus,
  PlusCircle,
  Megaphone,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ChevronRight,
  GraduationCap,
  Calendar,
} from "lucide-react";
import { DashboardLayout } from "@/shared/components/layouts";

interface MetricCardProps {
  readonly title: string;
  readonly value: string;
  readonly change: string;
  readonly isPositive: boolean;
  readonly icon: React.ElementType;
  readonly detail: string;
}

function MetricCard({
  title,
  value,
  change,
  isPositive,
  icon: Icon,
  detail,
}: MetricCardProps) {
  return (
    <div className="bg-card p-4 sm:p-5 rounded-xl border border-border shadow-2xs hover:border-primary/30 transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm font-medium text-muted-foreground">
          {title}
        </span>
        <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Icon size={18} />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {value}
        </span>
        <span
          className={`flex items-center text-xs font-semibold ${isPositive ? "text-primary" : "text-destructive"
            }`}
        >
          <TrendingUp size={13} className="mr-0.5" />
          {change}
        </span>
      </div>

      <p className="mt-1.5 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

interface StudentRecord {
  readonly id: string;
  readonly name: string;
  readonly grade: string;
  readonly section: string;
  readonly enrolledDate: string;
  readonly parentPhone: string;
  readonly status: "Active" | "Pending" | "Transferred";
}

const RECENT_STUDENTS: readonly StudentRecord[] = [
  {
    id: "STU-8821",
    name: "Eleanor Pena",
    grade: "Grade 11",
    section: "Science A",
    enrolledDate: "Today, 08:30 AM",
    parentPhone: "+1 (555) 234-5678",
    status: "Active",
  },
  {
    id: "STU-8820",
    name: "Marcus Vance",
    grade: "Grade 9",
    section: "General B",
    enrolledDate: "Yesterday",
    parentPhone: "+1 (555) 876-5432",
    status: "Active",
  },
  {
    id: "STU-8819",
    name: "Sophia Chen",
    grade: "Grade 12",
    section: "Math Honors",
    enrolledDate: "Aug 19, 2026",
    parentPhone: "+1 (555) 345-6789",
    status: "Active",
  },
  {
    id: "STU-8818",
    name: "Liam O'Connor",
    grade: "Grade 10",
    section: "Literature C",
    enrolledDate: "Aug 18, 2026",
    parentPhone: "+1 (555) 987-6543",
    status: "Pending",
  },
  {
    id: "STU-8817",
    name: "Amina Yusuf",
    grade: "Grade 11",
    section: "Science B",
    enrolledDate: "Aug 17, 2026",
    parentPhone: "+1 (555) 456-7890",
    status: "Active",
  },
];

interface UpcomingEvent {
  readonly id: string;
  readonly title: string;
  readonly date: string;
  readonly time: string;
  readonly category: string;
}

const UPCOMING_EVENTS: readonly UpcomingEvent[] = [
  {
    id: "ev-1",
    title: "Mid-Term Examination Review",
    date: "Aug 25, 2026",
    time: "09:00 AM",
    category: "Academic",
  },
  {
    id: "ev-2",
    title: "Parent-Teacher Association (PTA) Meeting",
    date: "Aug 28, 2026",
    time: "02:00 PM",
    category: "Community",
  },
  {
    id: "ev-3",
    title: "Annual STEM & Robotics Fair",
    date: "Sep 04, 2026",
    time: "10:00 AM",
    category: "Exhibition",
  },
  {
    id: "ev-4",
    title: "Faculty Professional Development Workshop",
    date: "Sep 10, 2026",
    time: "08:30 AM",
    category: "Staff",
  },
];

interface AttendanceDay {
  readonly day: string;
  readonly rate: number;
  readonly present: number;
  readonly total: number;
}

const WEEKLY_ATTENDANCE: readonly AttendanceDay[] = [
  { day: "Mon", rate: 97, present: 1378, total: 1420 },
  { day: "Tue", rate: 96, present: 1363, total: 1420 },
  { day: "Wed", rate: 98, present: 1392, total: 1420 },
  { day: "Thu", rate: 95, present: 1349, total: 1420 },
  { day: "Fri", rate: 96, present: 1369, total: 1420 },
];

export default function DashboardPage() {
  return (
    <DashboardLayout
      title="School Admin Dashboard"
      subtitle="Greenfield Academy — Academic Session 2025-2026"
    >
      <div className="bg-gradient-to-r from-primary to-emerald-700 rounded-2xl p-5 sm:p-7 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold mb-3">
            <GraduationCap size={15} />
            <span>Academic Term 2 in Progress</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            Welcome back, Administrator
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-emerald-50 leading-relaxed">
            All 48 classes are active today. Attendance is currently at 96.4%,
            with 4 new admissions pending review.
          </p>
        </div>

        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-8 translate-y-8 hidden md:block">
          <GraduationCap size={220} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Students"
          value="1,420"
          change="+3.2%"
          isPositive={true}
          icon={Users}
          detail="98 new enrollments this term"
        />
        <MetricCard
          title="Teachers & Staff"
          value="84"
          change="+1"
          isPositive={true}
          icon={UserCheck}
          detail="82 present on campus today"
        />
        <MetricCard
          title="Active Classes"
          value="48"
          change="100%"
          isPositive={true}
          icon={BookOpen}
          detail="Across 12 academic streams"
        />
        <MetricCard
          title="Today's Attendance"
          value="96.4%"
          change="+1.1%"
          isPositive={true}
          icon={CalendarCheck}
          detail="1,369 students present"
        />
      </div>

      <div className="bg-card rounded-xl border border-border p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm sm:text-base font-bold text-foreground">
            Quick Actions
          </h3>
          <span className="text-xs text-muted-foreground">Admin shortcuts</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/students"
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-center group"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <UserPlus size={20} />
            </div>
            <span className="text-xs font-semibold text-foreground group-hover:text-primary">
              Enroll Student
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5">
              Add admission
            </span>
          </Link>

          <Link
            href="/classes"
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-center group"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <PlusCircle size={20} />
            </div>
            <span className="text-xs font-semibold text-foreground group-hover:text-primary">
              Create Class
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5">
              New section
            </span>
          </Link>

          <Link
            href="/attendance"
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-center group"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <CheckCircle2 size={20} />
            </div>
            <span className="text-xs font-semibold text-foreground group-hover:text-primary">
              Attendance
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5">
              Daily logs
            </span>
          </Link>

          <Link
            href="/announcements"
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-center group"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Megaphone size={20} />
            </div>
            <span className="text-xs font-semibold text-foreground group-hover:text-primary">
              Announcement
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5">
              Send notice
            </span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-4 sm:p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Weekly Attendance Trends
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Daily student attendance performance this week
              </p>
            </div>
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full w-fit">
              Average: 96.4%
            </span>
          </div>

          <div className="space-y-4">
            {WEEKLY_ATTENDANCE.map((item) => (
              <div key={item.day} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground w-10">
                    {item.day}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">
                      {item.present} / {item.total}
                    </span>
                    <span className="font-bold text-foreground w-12 text-right">
                      {item.rate}%
                    </span>
                  </div>
                </div>
                <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${item.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>Target attendance rate: 95.0%</span>
            <span className="font-medium text-primary">All days on track</span>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-foreground">
              Upcoming Events
            </h3>
            <Link
              href="/calendar"
              className="text-xs font-semibold text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="space-y-3 flex-1">
            {UPCOMING_EVENTS.map((event) => (
              <div
                key={event.id}
                className="p-3 rounded-lg border border-border hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-foreground line-clamp-1">
                    {event.title}
                  </h4>
                  <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {event.category}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {event.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {event.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Recent Enrollments
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Latest admitted students for this term
            </p>
          </div>
          <Link
            href="/students"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            <span>Manage All Students</span>
            <ChevronRight size={15} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="px-4 sm:px-6 py-3">Student Name</th>
                <th className="px-4 sm:px-6 py-3">Grade & Section</th>
                <th className="px-4 sm:px-6 py-3 hidden md:table-cell">
                  Parent Contact
                </th>
                <th className="px-4 sm:px-6 py-3 hidden sm:table-cell">
                  Enrollment Date
                </th>
                <th className="px-4 sm:px-6 py-3">Status</th>
                <th className="px-4 sm:px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {RECENT_STUDENTS.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 sm:px-6 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {student.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {student.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3.5">
                    <p className="font-medium text-foreground">
                      {student.grade}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {student.section}
                    </p>
                  </td>
                  <td className="px-4 sm:px-6 py-3.5 hidden md:table-cell text-muted-foreground">
                    {student.parentPhone}
                  </td>
                  <td className="px-4 sm:px-6 py-3.5 hidden sm:table-cell text-muted-foreground">
                    {student.enrolledDate}
                  </td>
                  <td className="px-4 sm:px-6 py-3.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${student.status === "Active"
                          ? "bg-primary/10 text-primary"
                          : "bg-amber-500/10 text-amber-600"
                        }`}
                    >
                      {student.status}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3.5 text-right">
                    <Link
                      href={`/students?id=${student.id}`}
                      className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>View</span>
                      <ArrowUpRight size={13} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
