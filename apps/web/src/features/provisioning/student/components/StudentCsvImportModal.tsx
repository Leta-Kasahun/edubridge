"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { X, Upload, FileText, Download, CheckCircle2, Plus } from "lucide-react";
import { parseImportFile } from "@/shared/utils/csv-parser";
import { SubmitButton } from "@/shared/components/SubmitButton";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import { SelectDropdown, SelectDropdownOption } from "@/shared/components/SelectDropdown";
import {
  AcademicStructureAcademicYear,
  AcademicStructureGrade,
  BulkStudentCsvPayload,
} from "../types/student-provisioning.types";

export interface StudentCsvImportModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly academicYears: readonly AcademicStructureAcademicYear[];
  readonly selectedAcademicYearId?: string;
  readonly selectedGradeId?: string;
  readonly onSubmit: (payload: BulkStudentCsvPayload) => Promise<void>;
  readonly isSubmitting: boolean;
}

const SAMPLE_CSV =
  "firstName,middleName,lastName,gender,section\n" +
  "Abebe,Kebede,Tessema,MALE,Section A\n" +
  "Almaz,Haile,Girma,FEMALE,Section A\n" +
  "Dawit,Mulugeta,Assefa,MALE,\n" +
  "Sara,Yilma,Belay,FEMALE,";

function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const res = (err as { response?: { data?: { message?: string; error?: { message?: string } } } }).response;
    if (res?.data?.message) return res.data.message;
    if (res?.data?.error?.message) return res.data.error.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export function StudentCsvImportModal({
  isOpen,
  onClose,
  academicYears,
  selectedAcademicYearId,
  selectedGradeId,
  onSubmit,
  isSubmitting,
}: StudentCsvImportModalProps) {
  const [academicYearId, setAcademicYearId] = useState(selectedAcademicYearId || academicYears[0]?.id || "");
  const [gradeId, setGradeId] = useState(selectedGradeId || "");
  const [sectionId, setSectionId] = useState("");
  const [isCustomSection, setIsCustomSection] = useState(false);
  const [sectionName, setSectionName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [parsedStats, setParsedStats] = useState<{ total: number; valid: number; invalid: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (selectedAcademicYearId) {
        setAcademicYearId(selectedAcademicYearId);
      }
      if (selectedGradeId) {
        setGradeId(selectedGradeId);
      }
      setSectionId("");
      setIsCustomSection(false);
      setSectionName("");
      setFile(null);
      setCsvContent("");
      setError(null);
      setParsedStats(null);
    }
  }, [isOpen, selectedAcademicYearId, selectedGradeId]);

  const currentYear = useMemo(() => {
    return academicYears.find((y) => y.id === academicYearId) || academicYears[0] || null;
  }, [academicYears, academicYearId]);

  const grades: readonly AcademicStructureGrade[] = currentYear?.grades || [];
  const currentGrade = useMemo(() => {
    return grades.find((g) => g.id === gradeId) || grades[0] || null;
  }, [grades, gradeId]);

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
    return [
      {
        value: "",
        label: "Auto-distribute by capacity (Random)",
      },
      ...sections.map((s) => ({
        value: s.id,
        label: s.name,
        description: `${s.studentCount} students enrolled`,
        badge: `${s.studentCount} sts`,
      })),
    ];
  }, [sections]);

  if (!isOpen) return null;

  const handleDownloadCsvSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "students_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadExcelSample = async () => {
    try {
      const XLSX = await import("xlsx");
      const rows = [
        ["firstName", "middleName", "lastName", "gender", "section"],
        ["Abebe", "Kebede", "Tessema", "MALE", "Section A"],
        ["Almaz", "Haile", "Girma", "FEMALE", "Section A"],
        ["Dawit", "Mulugeta", "Assefa", "MALE", ""],
        ["Sara", "Yilma", "Belay", "FEMALE", ""],
      ];
      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
      XLSX.writeFile(workbook, "students_import_template.xlsx");
    } catch {
      handleDownloadCsvSample();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setError(null);
    setFile(selected);

    try {
      const { csvContent: extractedCsv, parseResult } = await parseImportFile(selected, [
        "firstName",
        "middleName",
        "gender",
      ]);
      setCsvContent(extractedCsv);
      setParsedStats({
        total: parseResult.totalRows,
        valid: parseResult.validRowCount,
        invalid: parseResult.invalidRowCount,
      });
    } catch {
      setError("Failed to parse the selected file. Please ensure it is a valid Excel (.xlsx, .xls) or CSV file.");
    }
  };

  const handleUploadSubmit = async () => {
    if (!file || !csvContent) {
      setError("Please select a valid Excel or CSV file to upload.");
      return;
    }

    if (isCustomSection && !sectionName.trim()) {
      setError("Please enter a section name or switch back to existing/auto.");
      return;
    }

    try {
      await onSubmit({
        academicYearId: academicYearId || currentYear?.id || "",
        gradeId: gradeId || currentGrade?.id || "",
        sectionId: isCustomSection ? undefined : sectionId || undefined,
        sectionName: isCustomSection ? sectionName.trim() : undefined,
        csvContent,
        fileName: file.name,
      });
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to import students. Please review the file rows and retry."));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto min-w-0">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border bg-card shrink-0">
          <div className="min-w-0 pr-2">
            <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
              Import Students (Excel / CSV)
            </h2>
            <p className="text-[11px] sm:text-xs text-muted-foreground truncate mt-0.5">
              Bulk enroll students for Grade {currentGrade?.level || "selected"}
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

        <div className="p-3.5 sm:p-6 space-y-3.5 sm:space-y-4 max-h-[calc(88vh-100px)] overflow-y-auto">
          {error && <ErrorAlert message={error} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <SelectDropdown
              label="Academic Year"
              required
              value={academicYearId}
              onChange={(val) => {
                setAcademicYearId(val);
                setSectionId("");
                setSectionName("");
              }}
              options={academicYearOptions}
              placeholder="Select academic year..."
            />

            <SelectDropdown
              label="Grade Level"
              required
              value={gradeId || currentGrade?.id || ""}
              onChange={(val) => {
                setGradeId(val);
                setSectionId("");
                setSectionName("");
              }}
              options={gradeOptions}
              placeholder="Select grade level..."
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-1 flex-wrap mb-1">
              <label className="text-xs font-semibold text-foreground">
                Section (Optional)
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomSection(!isCustomSection);
                  setSectionName("");
                  setSectionId("");
                }}
                className="inline-flex items-center gap-1 h-6 px-2 rounded-md text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
              >
                <Plus size={11} />
                <span>{isCustomSection ? "Existing" : "Section"}</span>
              </button>
            </div>

            {isCustomSection ? (
              <input
                type="text"
                placeholder="e.g. Section D, C"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                className="w-full h-10 px-3.5 text-xs sm:text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
            ) : (
              <SelectDropdown
                value={sectionId}
                onChange={(val) => setSectionId(val)}
                options={sectionOptions}
                placeholder="Auto-distribute by capacity (Random)"
              />
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-muted/20 border border-border gap-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <FileText size={15} className="text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <span className="text-xs text-foreground font-medium block truncate">
                  Download sample template
                </span>
                <span className="text-[11px] text-muted-foreground block truncate">
                  Auto-generates student codes; section is optional
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDownloadExcelSample}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs"
              >
                <Download size={13} />
                <span>Excel (.xlsx)</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadCsvSample}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs"
              >
                <Download size={13} />
                <span>CSV</span>
              </button>
            </div>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-foreground/40 rounded-2xl p-5 sm:p-6 text-center cursor-pointer transition-colors bg-background/50 flex flex-col items-center justify-center gap-2"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="p-3 rounded-full bg-muted/60 text-muted-foreground">
              <Upload size={20} />
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground block">
                {file ? file.name : "Click to select or drag and drop Excel (.xlsx, .xls) or CSV"}
              </span>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                Supported columns: firstName, middleName, lastName, gender, section
              </span>
            </div>
          </div>

          {parsedStats && (
            <div className="p-3 rounded-xl bg-background/50 border border-border flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 size={15} className="text-foreground shrink-0" />
                <span className="font-medium text-foreground truncate max-w-[180px] sm:max-w-[240px]">{file?.name}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-foreground font-semibold">
                  {parsedStats.total} rows ready
                </span>
                {parsedStats.invalid > 0 && (
                  <span className="text-rose-600 dark:text-rose-400 font-semibold">
                    ({parsedStats.invalid} invalid)
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-2.5 pt-3.5 sm:pt-4 border-t border-border mt-auto shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 h-10 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <SubmitButton
              type="button"
              disabled={!file || isSubmitting}
              isLoading={isSubmitting}
              loadingText="Processing..."
              onClick={handleUploadSubmit}
              className="w-full sm:w-auto h-10 px-5 text-xs sm:text-sm font-semibold"
            >
              Import & generate credentials
            </SubmitButton>
          </div>
        </div>
      </div>
    </div>
  );
}
