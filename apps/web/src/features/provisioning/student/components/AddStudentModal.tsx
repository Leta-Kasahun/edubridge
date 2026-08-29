"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { SubmitButton } from "@/shared/components/SubmitButton";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import {
  AcademicStructureAcademicYear,
  AcademicStructureGrade,
  SingleStudentProvisionPayload,
} from "../types/student-provisioning.types";

export interface AddStudentModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly academicYears: readonly AcademicStructureAcademicYear[];
  readonly selectedAcademicYearId?: string;
  readonly selectedGradeId?: string;
  readonly onSubmit: (payload: SingleStudentProvisionPayload) => Promise<void>;
  readonly isSubmitting: boolean;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const res = (err as { response?: { data?: { message?: string; error?: { message?: string } } } }).response;
    if (res?.data?.message) return res.data.message;
    if (res?.data?.error?.message) return res.data.error.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export function AddStudentModal({
  isOpen,
  onClose,
  academicYears,
  selectedAcademicYearId,
  selectedGradeId,
  onSubmit,
  isSubmitting,
}: AddStudentModalProps) {
  const [academicYearId, setAcademicYearId] = useState(selectedAcademicYearId || academicYears[0]?.id || "");
  const [gradeId, setGradeId] = useState(selectedGradeId || "");
  const [sectionId, setSectionId] = useState("");
  const [isCustomSection, setIsCustomSection] = useState(false);
  const [sectionName, setSectionName] = useState("");

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE">("FEMALE");
  const [studentCode, setStudentCode] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentYear = academicYears.find((y) => y.id === academicYearId) || academicYears[0];
  const grades: readonly AcademicStructureGrade[] = currentYear?.grades || [];
  const currentGrade = grades.find((g) => g.id === gradeId) || grades[0];
  const sections = currentGrade?.sections || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !middleName.trim()) {
      setError("First name and middle name are required.");
      return;
    }

    if (!isCustomSection && !sectionId && sections.length > 0) {
      setError("Please select a section for the student.");
      return;
    }

    if (isCustomSection && !sectionName.trim()) {
      setError("Please enter a section name.");
      return;
    }

    try {
      await onSubmit({
        academicYearId: academicYearId || currentYear?.id || "",
        gradeId: gradeId || currentGrade?.id || "",
        sectionId: isCustomSection ? undefined : sectionId || sections[0]?.id,
        sectionName: isCustomSection ? sectionName.trim() : undefined,
        firstName: firstName.trim(),
        middleName: middleName.trim(),
        lastName: lastName.trim() || undefined,
        gender,
        studentCode: studentCode.trim() || undefined,
        dateOfBirth: dateOfBirth || undefined,
        email: email.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Student could not be provisioned. Please verify the student information."));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border bg-card">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              Add New Student
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Provision student credentials and assign to section
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[calc(85vh-120px)] overflow-y-auto">
          {error && <ErrorAlert message={error} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Academic Year *
              </label>
              <select
                value={academicYearId}
                onChange={(e) => {
                  setAcademicYearId(e.target.value);
                  setSectionId("");
                }}
                className="w-full h-9.5 px-3 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-hidden focus:border-border"
              >
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>
                    {ay.name} {ay.isCurrent ? "(Current)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Grade Level *
              </label>
              <select
                value={gradeId || currentGrade?.id || ""}
                onChange={(e) => {
                  setGradeId(e.target.value);
                  setSectionId("");
                }}
                className="w-full h-9.5 px-3 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-hidden focus:border-border"
              >
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    Grade {g.level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-foreground">
                Section *
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomSection(!isCustomSection);
                  setSectionName("");
                }}
                className="text-[11px] text-muted-foreground hover:text-foreground font-medium cursor-pointer"
              >
                {isCustomSection ? "Choose from existing" : "+ New section name"}
              </button>
            </div>

            {isCustomSection ? (
              <input
                type="text"
                placeholder="e.g. Section D"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                className="w-full h-9.5 px-3 text-xs bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-border"
              />
            ) : (
              <select
                value={sectionId || sections[0]?.id || ""}
                onChange={(e) => setSectionId(e.target.value)}
                className="w-full h-9.5 px-3 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-hidden focus:border-border"
              >
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.studentCount} students)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                First Name *
              </label>
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full h-9.5 px-3 text-xs bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-border"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Middle / Father *
              </label>
              <input
                type="text"
                placeholder="Father name"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                className="w-full h-9.5 px-3 text-xs bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-border"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Grandfather
              </label>
              <input
                type="text"
                placeholder="Grandfather"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full h-9.5 px-3 text-xs bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Gender *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender("FEMALE")}
                  className={`h-9.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                    gender === "FEMALE"
                      ? "bg-muted text-foreground border-border font-bold"
                      : "bg-card text-muted-foreground border-border hover:bg-muted/40"
                  }`}
                >
                  Female
                </button>
                <button
                  type="button"
                  onClick={() => setGender("MALE")}
                  className={`h-9.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                    gender === "MALE"
                      ? "bg-muted text-foreground border-border font-bold"
                      : "bg-card text-muted-foreground border-border hover:bg-muted/40"
                  }`}
                >
                  Male
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Student Code (Optional)
              </label>
              <input
                type="text"
                placeholder="Auto-generated if blank"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                className="w-full h-9.5 px-3 text-xs bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Date of Birth (Optional)
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full h-9.5 px-3 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-hidden focus:border-border"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="student@school.edu.et"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-9.5 px-3 text-xs bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-border"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <SubmitButton
              isLoading={isSubmitting}
              loadingText="Provisioning..."
              className="w-auto h-9 px-4 text-xs font-semibold"
            >
              Provision student
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
