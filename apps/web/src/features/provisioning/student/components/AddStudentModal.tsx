"use client";

import { useState, useMemo } from "react";
import { X, Calendar, GraduationCap, Layers, User } from "lucide-react";
import { SubmitButton } from "@/shared/components/SubmitButton";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import { SelectDropdown, SelectDropdownOption } from "@/shared/components/SelectDropdown";
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
  const [error, setError] = useState<string | null>(null);

  const currentYear = useMemo(() => {
    return academicYears.find((y) => y.id === academicYearId) || academicYears[0] || null;
  }, [academicYears, academicYearId]);

  const grades: readonly AcademicStructureGrade[] = currentYear?.grades || [];
  const currentGrade = grades.find((g) => g.id === gradeId) || grades[0] || null;
  const sections = currentGrade?.sections || [];

  const academicYearOptions: readonly SelectDropdownOption[] = useMemo(() => {
    return academicYears.map((ay) => ({
      value: ay.id,
      label: ay.name,
      badge: ay.isCurrent ? "Current" : undefined,
    }));
  }, [academicYears]);

  const gradeOptions: readonly SelectDropdownOption[] = useMemo(() => {
    return grades.map((g) => ({
      value: g.id,
      label: `Grade ${g.level}`,
      badge: `G${g.level}`,
    }));
  }, [grades]);

  const sectionOptions: readonly SelectDropdownOption[] = useMemo(() => {
    return sections.map((s) => ({
      value: s.id,
      label: s.name,
      description: `${s.studentCount} students enrolled`,
      badge: `${s.studentCount} sts`,
    }));
  }, [sections]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !middleName.trim()) {
      setError("First name and father name are required.");
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
      });
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Student could not be provisioned. Please verify the student information."));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto min-w-0">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border bg-card shrink-0">
          <div className="min-w-0 pr-2">
            <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
              Add New Student
            </h2>
            <p className="text-[11px] sm:text-xs text-muted-foreground truncate mt-0.5">
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

        <form onSubmit={handleSubmit} className="p-3.5 sm:p-6 space-y-3.5 sm:space-y-4 max-h-[calc(88vh-100px)] overflow-y-auto">
          {error && <ErrorAlert message={error} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <SelectDropdown
              label="Academic Year"
              required
              value={academicYearId}
              onChange={(val) => {
                setAcademicYearId(val);
                setSectionId("");
              }}
              options={academicYearOptions}
              placeholder="Select academic year..."
              leftIcon={Calendar}
            />

            <SelectDropdown
              label="Grade Level"
              required
              value={gradeId || currentGrade?.id || ""}
              onChange={(val) => {
                setGradeId(val);
                setSectionId("");
              }}
              options={gradeOptions}
              placeholder="Select grade level..."
              leftIcon={GraduationCap}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-1 flex-wrap">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Layers size={13} className="text-muted-foreground" />
                Class Section <span className="text-destructive">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomSection(!isCustomSection);
                  setSectionName("");
                }}
                className="text-[11px] text-muted-foreground hover:text-primary font-medium cursor-pointer"
              >
                {isCustomSection ? "Choose from existing" : "+ New custom section"}
              </button>
            </div>

            {isCustomSection ? (
              <input
                type="text"
                placeholder="e.g. Section D, Section C"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                className="w-full h-10 px-3.5 text-xs sm:text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
            ) : (
              <SelectDropdown
                value={sectionId || sections[0]?.id || ""}
                onChange={(val) => setSectionId(val)}
                options={sectionOptions}
                placeholder={sections.length === 0 ? "No sections available" : "Select class section..."}
                leftIcon={Layers}
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground">
                First Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full h-10 px-3 text-xs sm:text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground">
                Middle / Father <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="Father name"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                className="w-full h-10 px-3 text-xs sm:text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground">
                Grandfather
              </label>
              <input
                type="text"
                placeholder="Grandfather"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full h-10 px-3 text-xs sm:text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground">
                Gender <span className="text-destructive">*</span>
              </label>
                <div className="grid grid-cols-2 gap-2 h-10">
                  <button
                    type="button"
                    onClick={() => setGender("FEMALE")}
                    className={`rounded-xl text-xs sm:text-sm font-semibold tracking-wide uppercase border transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.99] ${
                      gender === "FEMALE"
                        ? "border-2 border-primary text-primary bg-primary/5 font-bold shadow-xs"
                        : "border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 bg-background/50"
                    }`}
                  >
                    <User size={15} className="shrink-0" />
                    <span>Female</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender("MALE")}
                    className={`rounded-xl text-xs sm:text-sm font-semibold tracking-wide uppercase border transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.99] ${
                      gender === "MALE"
                        ? "border-2 border-primary text-primary bg-primary/5 font-bold shadow-xs"
                        : "border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 bg-background/50"
                    }`}
                  >
                    <User size={15} className="shrink-0" />
                    <span>Male</span>
                  </button>
                </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground">
                Student Code (Optional)
              </label>
              <input
                type="text"
                placeholder="Auto-generated if blank"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                className="w-full h-10 px-3 text-xs sm:text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-2.5 pt-3.5 sm:pt-4 border-t border-border mt-auto shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 h-10 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <SubmitButton
              isLoading={isSubmitting}
              loadingText="Onboarding..."
              className="w-full sm:w-auto h-10 px-5 text-xs sm:text-sm font-semibold"
            >
              Onboard Student
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
