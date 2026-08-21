import Link from "next/link";
import {
  BookOpen,
  Plus,
  Users,
  UserCheck,
  Search,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { DashboardLayout } from "@/shared/components/layouts";

interface ClassSection {
  readonly id: string;
  readonly name: string;
  readonly grade: string;
  readonly teacher: string;
  readonly studentCount: number;
  readonly maxCapacity: number;
  readonly room: string;
  readonly schedule: string;
}

const CLASSES_LIST: readonly ClassSection[] = [
  {
    id: "CLS-101",
    name: "Advanced Physics & Mechanics",
    grade: "Grade 11",
    teacher: "Dr. Evelyn Reed",
    studentCount: 32,
    maxCapacity: 35,
    room: "Lab 302",
    schedule: "Mon, Wed, Fri (08:30 AM)",
  },
  {
    id: "CLS-102",
    name: "Calculus & Linear Algebra",
    grade: "Grade 12",
    teacher: "Prof. Arthur Pendelton",
    studentCount: 28,
    maxCapacity: 30,
    room: "Room 204",
    schedule: "Tue, Thu (10:00 AM)",
  },
  {
    id: "CLS-103",
    name: "World Literature & Composition",
    grade: "Grade 10",
    teacher: "Ms. Clara Vance",
    studentCount: 30,
    maxCapacity: 30,
    room: "Room 105",
    schedule: "Mon, Wed (01:15 PM)",
  },
  {
    id: "CLS-104",
    name: "Organic Chemistry & Biochemistry",
    grade: "Grade 11",
    teacher: "Dr. Nathan Bailey",
    studentCount: 26,
    maxCapacity: 30,
    room: "Lab 301",
    schedule: "Tue, Thu, Fri (09:15 AM)",
  },
  {
    id: "CLS-105",
    name: "World History & Geography",
    grade: "Grade 9",
    teacher: "Mr. Samuel Foster",
    studentCount: 34,
    maxCapacity: 35,
    room: "Room 112",
    schedule: "Mon, Wed, Fri (11:00 AM)",
  },
  {
    id: "CLS-106",
    name: "Computer Science & Python",
    grade: "Grade 10",
    teacher: "Mrs. Maya Lin",
    studentCount: 24,
    maxCapacity: 25,
    room: "Tech Lab 1",
    schedule: "Tue, Thu (02:00 PM)",
  },
];

export default function ClassesPage() {
  return (
    <DashboardLayout
      title="Classes & Sections"
      subtitle="Manage curriculum, classrooms, and teacher course assignments"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <BookOpen size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Active Classrooms
            </h2>
            <p className="text-xs text-muted-foreground">
              48 active sections across secondary and senior secondary
            </p>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors shadow-2xs w-fit"
        >
          <Plus size={15} />
          <span>Create New Class</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CLASSES_LIST.map((cls) => {
          const occupancyRate = Math.round((cls.studentCount / cls.maxCapacity) * 100);

          return (
            <div
              key={cls.id}
              className="bg-card rounded-xl border border-border p-4 sm:p-5 shadow-2xs hover:border-primary/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {cls.grade}
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {cls.room}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-foreground line-clamp-1 mb-1">
                  {cls.name}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-4">
                  <UserCheck size={13} className="text-primary" />
                  <span>{cls.teacher}</span>
                </p>

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Users size={12} />
                      Capacity
                    </span>
                    <span className="font-semibold text-foreground">
                      {cls.studentCount} / {cls.maxCapacity} students
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${occupancyRate}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-[11px] text-muted-foreground truncate max-w-[170px]">
                  {cls.schedule}
                </span>
                <Link
                  href={`/classes?id=${cls.id}`}
                  className="font-semibold text-primary hover:underline inline-flex items-center gap-0.5"
                >
                  <span>Manage</span>
                  <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
