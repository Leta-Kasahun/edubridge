"use client";

import { useState, useEffect, useMemo } from "react";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import {
  useAcademicStructure,
  useStudents,
  useCreateGrade,
  useCreateSection,
  useProvisionStudent,
  useBulkProvisionStudentCsv,
  useActivateStudent,
  useDeactivateStudent,
} from "../hooks";
import { StudentToolbar } from "./StudentToolbar";
import { StudentGradePills } from "./StudentGradePills";
import { StudentSectionList } from "./StudentSectionList";
import { StudentDetailModal } from "./StudentDetailModal";
import { AddStudentModal } from "./AddStudentModal";
import { StudentCsvImportModal } from "./StudentCsvImportModal";
import { AddGradeModal } from "./AddGradeModal";
import { AddSectionModal } from "./AddSectionModal";
import { StudentProvisioningResultModal } from "./StudentProvisioningResultModal";
import {
  StudentRecord,
  StudentAccountStatus,
  StudentBulkProvisionResult,
  StudentProvisionResult,
  SingleStudentProvisionPayload,
  BulkStudentCsvPayload,
} from "../types/student-provisioning.types";

export function StudentProvisioningManager() {
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string | undefined>(undefined);
  const [selectedGradeId, setSelectedGradeId] = useState<string | undefined>(undefined);
  const [openSectionIds, setOpenSectionIds] = useState<Set<string>>(new Set());

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [accountStatus, setAccountStatus] = useState<string>("ALL");
  const [gender, setGender] = useState<string>("ALL");

  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isImportCsvOpen, setIsImportCsvOpen] = useState(false);
  const [isAddGradeOpen, setIsAddGradeOpen] = useState(false);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);

  const [detailStudent, setDetailStudent] = useState<StudentRecord | null>(null);
  const [provisionResult, setProvisionResult] = useState<
    StudentBulkProvisionResult | StudentProvisionResult | null
  >(null);

  const { data: structureData, isLoading: isStructureLoading } =
    useAcademicStructure(selectedAcademicYearId);

  const academicYears = structureData?.academicYears || [];
  const currentAcademicYear =
    academicYears.find((y) => y.id === selectedAcademicYearId) ||
    structureData?.currentAcademicYear ||
    academicYears[0];

  const currentYearId = currentAcademicYear?.id;
  const grades = currentAcademicYear?.grades || [];

  useEffect(() => {
    if (!selectedAcademicYearId && currentYearId) {
      setSelectedAcademicYearId(currentYearId);
    }
  }, [selectedAcademicYearId, currentYearId]);

  useEffect(() => {
    if (grades.length > 0) {
      const exists = grades.some((g) => g.id === selectedGradeId);
      if (!exists) {
        setSelectedGradeId(grades[0]?.id);
      }
    }
  }, [grades, selectedGradeId]);

  const currentGrade = grades.find((g) => g.id === selectedGradeId) || grades[0];
  const sections = useMemo(() => {
    const raw = currentGrade?.sections || [];
    return [...raw].sort((a, b) =>
      a.name.trim().toLowerCase().localeCompare(b.name.trim().toLowerCase(), undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );
  }, [currentGrade?.sections]);

  useEffect(() => {
    if (sections.length > 0) {
      setOpenSectionIds((prev) => {
        if (prev.size === 0 && sections[0]?.id) {
          return new Set([sections[0].id]);
        }
        return prev;
      });
    }
  }, [sections]);

  const queryFilters = useMemo(
    () => ({
      academicYearId: currentYearId,
      gradeId: currentGrade?.id,
      search: debouncedSearch.trim() || undefined,
      accountStatus: accountStatus !== "ALL" ? (accountStatus as StudentAccountStatus) : undefined,
      gender: gender !== "ALL" ? (gender as "MALE" | "FEMALE") : undefined,
      limit: 100,
    }),
    [currentYearId, currentGrade?.id, debouncedSearch, accountStatus, gender]
  );

  const { data: studentsData, isLoading: isStudentsLoading } = useStudents(queryFilters);
  const students = studentsData?.data || [];

  const createGradeMutation = useCreateGrade();
  const createSectionMutation = useCreateSection();
  const provisionStudentMutation = useProvisionStudent();
  const bulkCsvMutation = useBulkProvisionStudentCsv();
  const activateMutation = useActivateStudent();
  const deactivateMutation = useDeactivateStudent();

  const handleToggleSection = (sectionId: string) => {
    setOpenSectionIds((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const handleCreateGrade = async (level: number) => {
    await createGradeMutation.mutateAsync({ level });
  };

  const handleCreateSection = async (payload: {
    academicYearId: string;
    gradeId: string;
    name: string;
    capacity?: number;
  }) => {
    await createSectionMutation.mutateAsync(payload);
  };

  const handleProvisionStudent = async (payload: SingleStudentProvisionPayload) => {
    const res = await provisionStudentMutation.mutateAsync(payload);
    setProvisionResult(res);
  };

  const handleBulkCsv = async (payload: BulkStudentCsvPayload) => {
    const res = await bulkCsvMutation.mutateAsync(payload);
    setProvisionResult(res);
  };

  const handleActivateStudent = async (student: StudentRecord) => {
    await activateMutation.mutateAsync(student.studentProfileId);
  };

  const handleDeactivateStudent = async (student: StudentRecord) => {
    await deactivateMutation.mutateAsync({
      id: student.studentProfileId,
      status: "INACTIVE",
    });
  };

  return (
    <div className="space-y-6">
      <StudentToolbar
        search={search}
        onSearchChange={setSearch}
        accountStatus={accountStatus}
        onAccountStatusChange={setAccountStatus}
        gender={gender}
        onGenderChange={setGender}
        academicYears={academicYears}
        selectedAcademicYearId={currentYearId}
        onSelectAcademicYear={(id) => {
          setSelectedAcademicYearId(id);
          setSelectedGradeId(undefined);
          setOpenSectionIds(new Set());
        }}
        onOpenAddStudent={() => setIsAddStudentOpen(true)}
        onOpenImportCsv={() => setIsImportCsvOpen(true)}
      />

      <StudentGradePills
        grades={grades}
        selectedGradeId={currentGrade?.id}
        onSelectGrade={(id) => {
          setSelectedGradeId(id);
          setOpenSectionIds(new Set());
        }}
        onOpenAddGrade={() => setIsAddGradeOpen(true)}
      />

      {isStructureLoading || isStudentsLoading ? (
        <div className="rounded-2xl bg-card border border-border p-12 flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
          <LoadingSpinner size={24} />
          <span>Loading student provisioning data...</span>
        </div>
      ) : grades.length === 0 ? (
        <div className="rounded-2xl bg-card border border-border p-10 text-center space-y-3">
          <p className="text-xs text-muted-foreground">
            No grade levels configured for this academic year yet.
          </p>
          <button
            type="button"
            onClick={() => setIsAddGradeOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
          >
            Add first grade level
          </button>
        </div>
      ) : (
        <StudentSectionList
          sections={sections}
          students={students}
          openSectionIds={openSectionIds}
          onToggleSection={handleToggleSection}
          onOpenAddSection={() => setIsAddSectionOpen(true)}
          onViewDetails={setDetailStudent}
          onActivate={handleActivateStudent}
          onDeactivate={handleDeactivateStudent}
        />
      )}

      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        academicYears={academicYears}
        selectedAcademicYearId={currentYearId}
        selectedGradeId={currentGrade?.id}
        onSubmit={handleProvisionStudent}
        isSubmitting={provisionStudentMutation.isPending}
      />

      <StudentCsvImportModal
        isOpen={isImportCsvOpen}
        onClose={() => setIsImportCsvOpen(false)}
        academicYears={academicYears}
        selectedAcademicYearId={currentYearId}
        selectedGradeId={currentGrade?.id}
        onSubmit={handleBulkCsv}
        isSubmitting={bulkCsvMutation.isPending}
      />

      <AddGradeModal
        isOpen={isAddGradeOpen}
        onClose={() => setIsAddGradeOpen(false)}
        onSubmit={handleCreateGrade}
        isSubmitting={createGradeMutation.isPending}
      />

      <AddSectionModal
        isOpen={isAddSectionOpen}
        onClose={() => setIsAddSectionOpen(false)}
        academicYearId={currentYearId || ""}
        gradeId={currentGrade?.id || ""}
        gradeLevel={currentGrade?.level}
        onSubmit={handleCreateSection}
        isSubmitting={createSectionMutation.isPending}
      />

      <StudentDetailModal
        student={detailStudent}
        isOpen={Boolean(detailStudent)}
        onClose={() => setDetailStudent(null)}
      />

      <StudentProvisioningResultModal
        result={provisionResult}
        isOpen={Boolean(provisionResult)}
        onClose={() => setProvisionResult(null)}
      />
    </div>
  );
}
