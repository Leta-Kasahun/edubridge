import Link from "next/link";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  ArrowUpRight,
  Download,
  GraduationCap,
} from "lucide-react";
import { DashboardLayout } from "@/shared/components/layouts";

interface StudentItem {
  readonly id: string;
  readonly name: string;
  readonly rollNumber: string;
  readonly grade: string;
  readonly section: string;
  readonly gender: string;
  readonly guardian: string;
  readonly guardianPhone: string;
  readonly status: "Active" | "Pending" | "Inactive";
}

const STUDENTS_LIST: readonly StudentItem[] = [
  {
    id: "STU-8821",
    name: "Eleanor Pena",
    rollNumber: "2026-11A-01",
    grade: "Grade 11",
    section: "Science A",
    gender: "Female",
    guardian: "Robert Pena",
    guardianPhone: "+1 (555) 234-5678",
    status: "Active",
  },
  {
    id: "STU-8820",
    name: "Marcus Vance",
    rollNumber: "2026-09B-14",
    grade: "Grade 9",
    section: "General B",
    gender: "Male",
    guardian: "Linda Vance",
    guardianPhone: "+1 (555) 876-5432",
    status: "Active",
  },
  {
    id: "STU-8819",
    name: "Sophia Chen",
    rollNumber: "2026-12H-03",
    grade: "Grade 12",
    section: "Math Honors",
    gender: "Female",
    guardian: "David Chen",
    guardianPhone: "+1 (555) 345-6789",
    status: "Active",
  },
  {
    id: "STU-8818",
    name: "Liam O'Connor",
    rollNumber: "2026-10C-22",
    grade: "Grade 10",
    section: "Literature C",
    gender: "Male",
    guardian: "Sarah O'Connor",
    guardianPhone: "+1 (555) 987-6543",
    status: "Pending",
  },
  {
    id: "STU-8817",
    name: "Amina Yusuf",
    rollNumber: "2026-11B-08",
    grade: "Grade 11",
    section: "Science B",
    gender: "Female",
    guardian: "Tariq Yusuf",
    guardianPhone: "+1 (555) 456-7890",
    status: "Active",
  },
  {
    id: "STU-8816",
    name: "Noah Patel",
    rollNumber: "2026-08A-19",
    grade: "Grade 8",
    section: "General A",
    gender: "Male",
    guardian: "Priya Patel",
    guardianPhone: "+1 (555) 678-1234",
    status: "Active",
  },
];

export default function StudentsPage() {
  return (
    <DashboardLayout
      title="Student Directory"
      subtitle="Manage student admissions, profiles, and academic records"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Users size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              All Students
            </h2>
            <p className="text-xs text-muted-foreground">
              Total 1,420 registered students across all grades
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors shadow-2xs"
          >
            <UserPlus size={14} />
            <span>Enroll Student</span>
          </button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="search"
            placeholder="Search by student name, roll number, or ID..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-muted/50 focus:bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted text-foreground"
          >
            <Filter size={14} />
            <span>Filter Grade</span>
          </button>

          <select className="h-9 px-3 text-xs font-medium bg-card border border-border rounded-lg text-foreground focus:outline-hidden focus:border-primary">
            <option>All Sections</option>
            <option>Science</option>
            <option>Mathematics</option>
            <option>Literature</option>
          </select>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="px-4 sm:px-6 py-3">Student Name</th>
                <th className="px-4 sm:px-6 py-3">Roll / ID</th>
                <th className="px-4 sm:px-6 py-3">Grade & Section</th>
                <th className="px-4 sm:px-6 py-3 hidden md:table-cell">Gender</th>
                <th className="px-4 sm:px-6 py-3 hidden lg:table-cell">
                  Guardian & Phone
                </th>
                <th className="px-4 sm:px-6 py-3">Status</th>
                <th className="px-4 sm:px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {STUDENTS_LIST.map((student) => (
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
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3.5 font-mono text-muted-foreground">
                    {student.rollNumber}
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
                    {student.gender}
                  </td>
                  <td className="px-4 sm:px-6 py-3.5 hidden lg:table-cell text-muted-foreground">
                    <p className="font-medium text-foreground">
                      {student.guardian}
                    </p>
                    <p className="text-[11px]">{student.guardianPhone}</p>
                  </td>
                  <td className="px-4 sm:px-6 py-3.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        student.status === "Active"
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
                      <span>Profile</span>
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
