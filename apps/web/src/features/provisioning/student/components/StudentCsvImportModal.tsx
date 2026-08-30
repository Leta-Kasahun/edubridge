"use client";

import { useState, useRef, useEffect } from "react";
import { X, Upload, FileText, Download, CheckCircle2 } from "lucide-react";
import { parseImportFile } from "@/shared/utils/csv-parser";
import { SubmitButton } from "@/shared/components/SubmitButton";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
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

  if (!isOpen) return null;

  const currentYear = academicYears.find((y) => y.id === academicYearId) || academicYears[0];
  const grades: readonly AcademicStructureGrade[] = currentYear?.grades || [];
  const currentGrade = grades.find((g) => g.id === gradeId) || grades[0];
  const sections = currentGrade?.sections || [];

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border bg-card">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              Import Students (Excel / CSV)
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
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

        <div className="p-4 sm:p-6 space-y-4 max-h-[calc(85vh-120px)] overflow-y-auto">
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
                  setSectionName("");
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
                  setSectionName("");
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
                Section (Optional)
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomSection(!isCustomSection);
                  setSectionName("");
                  setSectionId("");
                }}
                className="text-[11px] text-muted-foreground hover:text-foreground font-medium cursor-pointer"
              >
                {isCustomSection ? "Choose from existing" : "+ New section name"}
              </button>
            </div>

            {isCustomSection ? (
              <input
                type="text"
                placeholder="e.g. Section D, C"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                className="w-full h-9.5 px-3 text-xs bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-border"
              />
            ) : (
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                className="w-full h-9.5 px-3 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-hidden focus:border-border"
              >
                <option value="">Auto-distribute by capacity (Random)</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.studentCount} students)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border gap-2">
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
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs"
              >
                <Download size={13} />
                <span>Excel (.xlsx)</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadCsvSample}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs"
              >
                <Download size={13} />
                <span>CSV</span>
              </button>
            </div>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-foreground/40 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-background/50 flex flex-col items-center justify-center gap-2"
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
                <span className="font-medium text-foreground truncate max-w-[200px]">{file?.name}</span>
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

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <SubmitButton
              type="button"
              disabled={!file || isSubmitting}
              isLoading={isSubmitting}
              loadingText="Processing..."
              onClick={handleUploadSubmit}
              className="w-auto h-9 px-4 text-xs font-semibold"
            >
              Import & generate credentials
            </SubmitButton>
          </div>
        </div>
      </div>
    </div>
  );
}
